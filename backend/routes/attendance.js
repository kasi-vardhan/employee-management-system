const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const { authorize: roleAuthorize } = require('../middleware/roleAuth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const { sendEmail, emailTemplates } = require('../config/email');

// Get all attendance records
router.get('/', protect, async (req, res) => {
  try {
    const { employee, date, month, year } = req.query;
    
    let query = {};
    
    if (employee) {
      query.employee = employee;
    }
    
    if (date) {
      query.date = new Date(date);
    }
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query)
      .populate('employee', 'name email employeeId')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get attendance for a specific employee
router.get('/employee/:employeeId', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { employee: req.params.employeeId };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 });
    
    // Calculate attendance percentage
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: attendance,
      stats: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: parseFloat(percentage)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Mark attendance (Admin and Manager only)
router.post('/', protect, roleAuthorize('admin', 'manager'), async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, notes } = req.body;
    
    // Check if employee exists
    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // Check if attendance already marked for this date
    const existing = await Attendance.findOne({ 
      employee, 
      date: new Date(date).setHours(0,0,0,0) 
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already marked for this date' 
      });
    }
    
    const attendance = await Attendance.create({
      employee,
      date: new Date(date).setHours(0,0,0,0),
      status,
      checkIn,
      checkOut,
      notes
    });
    
    // Send email notification to employee
    const emailTemplate = emailTemplates.attendanceMarked(
      emp.name,
      date,
      status,
      checkIn
    );
    await sendEmail({
      to: emp.email,
      ...emailTemplate
    });
    
    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update attendance
router.put('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'name email');
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete attendance
router.delete('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get today's attendance
router.get('/today/summary', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const present = await Attendance.countDocuments({ 
      date: today, 
      status: 'Present' 
    });
    
    const absent = await Attendance.countDocuments({ 
      date: today, 
      status: 'Absent' 
    });
    
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    
    res.json({
      success: true,
      data: {
        date: today,
        present,
        absent,
        notMarked: totalEmployees - present - absent,
        totalEmployees
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Export attendance to CSV
router.get('/export/csv', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query)
      .populate('employee', 'name email employeeId')
      .sort({ date: -1 });
    
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../exports/attendance.csv'),
      header: [
        { id: 'employeeName', title: 'Employee Name' },
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'email', title: 'Email' },
        { id: 'date', title: 'Date' },
        { id: 'status', title: 'Status' },
        { id: 'checkIn', title: 'Check In' },
        { id: 'checkOut', title: 'Check Out' },
        { id: 'notes', title: 'Notes' }
      ]
    });
    
    const records = attendance.map(att => ({
      employeeName: att.employee?.name || 'N/A',
      employeeId: att.employee?.employeeId || 'N/A',
      email: att.employee?.email || 'N/A',
      date: att.date.toISOString().split('T')[0],
      status: att.status,
      checkIn: att.checkIn || 'N/A',
      checkOut: att.checkOut || 'N/A',
      notes: att.notes || 'N/A'
    }));
    
    await csvWriter.writeRecords(records);
    
    res.download(path.join(__dirname, '../exports/attendance.csv'), 'attendance.csv');
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
