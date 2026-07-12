const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const { authorize: roleAuthorize } = require('../middleware/roleAuth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

// Get all departments
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get single department with employees
router.get('/:id', protect, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }
    
    const employees = await Employee.find({ department: req.params.id })
      .select('name email designation status');
    
    res.json({
      success: true,
      data: {
        ...department.toObject(),
        employees
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

// Create department (Admin and Manager only)
router.post('/', protect, roleAuthorize('admin', 'manager'), async (req, res) => {
  try {
    const { name, description, head } = req.body;
    
    const department = await Department.create({
      name,
      description,
      head
    });
    
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department name already exists' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update department (Admin and Manager only)
router.put('/:id', protect, roleAuthorize('admin', 'manager'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }
    
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete department (Admin only)
router.delete('/:id', protect, roleAuthorize('admin'), async (req, res) => {
  try {
    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete department with employees' 
      });
    }
    
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Export departments to CSV
router.get('/export/csv', protect, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../exports/departments.csv'),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'head', title: 'Head' },
        { id: 'createdAt', title: 'Created At' }
      ]
    });
    
    await csvWriter.writeRecords(departments);
    
    res.download(path.join(__dirname, '../exports/departments.csv'), 'departments.csv');
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
