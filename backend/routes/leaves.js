const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const { authorize: roleAuthorize } = require('../middleware/roleAuth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const { sendEmail, emailTemplates } = require('../config/email');

// Get all leave requests
router.get('/', protect, async (req, res) => {
  try {
    const { employee, status, type } = req.query;
    
    let query = {};
    
    if (employee) {
      query.employee = employee;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    const leaves = await Leave.find(query)
      .populate('employee', 'name email employeeId')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get leave requests for a specific employee
router.get('/employee/:employeeId', protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.params.employeeId })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create leave request (All authenticated users can create)
router.post('/', protect, async (req, res) => {
  try {
    const { employee, type, startDate, endDate, reason } = req.body;
    
    // Check if employee exists
    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    const leave = await Leave.create({
      employee,
      type,
      startDate,
      endDate,
      reason
    });
    
    // Send email notification to managers/admins about pending leave
    // For now, we'll send to a default email - in production, you'd fetch manager emails
    const managerEmail = process.env.EMAIL_MANAGER || process.env.EMAIL_USER;
    if (managerEmail) {
      const emailTemplate = emailTemplates.leavePending(
        'Manager',
        emp.name,
        type,
        startDate,
        endDate
      );
      await sendEmail({
        to: managerEmail,
        ...emailTemplate
      });
    }
    
    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Approve/Reject leave (Admin and Manager only)
router.put('/:id/status', protect, roleAuthorize('admin', 'manager'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const approvedBy = req.user.id;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy,
        approvedDate: new Date(),
        rejectionReason: status === 'Rejected' ? rejectionReason : null
      },
      { new: true, runValidators: true }
    ).populate('employee', 'name email').populate('approvedBy', 'name email');
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: 'Leave request not found' 
      });
    }
    
    // Send email notification to employee
    if (status === 'Approved') {
      const emailTemplate = emailTemplates.leaveApproved(
        leave.employee.name,
        leave.type,
        leave.startDate,
        leave.endDate
      );
      await sendEmail({
        to: leave.employee.email,
        ...emailTemplate
      });
    } else if (status === 'Rejected') {
      const emailTemplate = emailTemplates.leaveRejected(
        leave.employee.name,
        leave.type,
        leave.startDate,
        leave.endDate,
        rejectionReason
      );
      await sendEmail({
        to: leave.employee.email,
        ...emailTemplate
      });
    }
    
    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete leave request
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: 'Leave request not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Export leaves to CSV
router.get('/export/csv', protect, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const leaves = await Leave.find(query)
      .populate('employee', 'name email employeeId')
      .sort({ createdAt: -1 });
    
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../exports/leaves.csv'),
      header: [
        { id: 'employeeName', title: 'Employee Name' },
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'email', title: 'Email' },
        { id: 'type', title: 'Leave Type' },
        { id: 'startDate', title: 'Start Date' },
        { id: 'endDate', title: 'End Date' },
        { id: 'reason', title: 'Reason' },
        { id: 'status', title: 'Status' },
        { id: 'approvedBy', title: 'Approved By' },
        { id: 'createdAt', title: 'Applied On' }
      ]
    });
    
    const records = leaves.map(leave => ({
      employeeName: leave.employee?.name || 'N/A',
      employeeId: leave.employee?.employeeId || 'N/A',
      email: leave.employee?.email || 'N/A',
      type: leave.type,
      startDate: leave.startDate.toISOString().split('T')[0],
      endDate: leave.endDate.toISOString().split('T')[0],
      reason: leave.reason || 'N/A',
      status: leave.status,
      approvedBy: leave.approvedBy || 'N/A',
      createdAt: leave.createdAt.toISOString().split('T')[0]
    }));
    
    await csvWriter.writeRecords(records);
    
    res.download(path.join(__dirname, '../exports/leaves.csv'), 'leaves.csv');
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
