const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { protect } = require('../middleware/auth');
const { authorize: roleAuthorize } = require('../middleware/roleAuth');
const { storage } = require('../config/cloudinary');
const multer = require('multer');

const upload = multer({ storage });
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

// Get all employees with search, filter, sort, and pagination
router.get('/', protect, async (req, res) => {
  try {
    const { search, department, status, sortBy, sortOrder, page = 1, limit = 10, minSalary, maxSalary, startDate, endDate } = req.query;
    
    let query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by department (supports multiple departments)
    if (department) {
      const departments = Array.isArray(department) ? department : [department];
      query.department = { $in: departments };
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by salary range
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = parseFloat(minSalary);
      if (maxSalary) query.salary.$lte = parseFloat(maxSalary);
    }
    
    // Filter by joining date range
    if (startDate || endDate) {
      query.joiningDate = {};
      if (startDate) query.joiningDate.$gte = new Date(startDate);
      if (endDate) query.joiningDate.$lte = new Date(endDate);
    }
    
    // Sort options
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('department', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: employees.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: employees
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get single employee
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create employee (Admin and Manager only)
router.post('/', protect, roleAuthorize('admin', 'manager'), async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate, status, profileImage } = req.body;
    
    console.log('Creating employee with data:', { name, email, phone, department, designation, salary, joiningDate, status });
    
    // Check if department exists
    const dept = await Department.findById(department);
    if (!dept) {
      console.log('Department not found:', department);
      return res.status(400).json({ 
        success: false, 
        message: 'Department not found. Please create a department first.' 
      });
    }
    
    const employee = await Employee.create({
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
      profileImage
    });
    
    console.log('Employee created successfully:', employee);
    
    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update employee (Admin and Manager only)
router.put('/:id', protect, roleAuthorize('admin', 'manager'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete employee (Admin only)
router.delete('/:id', protect, roleAuthorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Export employees to CSV
router.get('/export/csv', protect, async (req, res) => {
  try {
    const employees = await Employee.find().populate('department', 'name');
    
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../exports/employees.csv'),
      header: [
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'department', title: 'Department' },
        { id: 'designation', title: 'Designation' },
        { id: 'salary', title: 'Salary' },
        { id: 'joiningDate', title: 'Joining Date' },
        { id: 'status', title: 'Status' }
      ]
    });
    
    const records = employees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department?.name || '',
      designation: emp.designation,
      salary: emp.salary,
      joiningDate: emp.joiningDate.toISOString().split('T')[0],
      status: emp.status
    }));
    
    await csvWriter.writeRecords(records);
    
    res.download(path.join(__dirname, '../exports/employees.csv'), 'employees.csv');
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Upload profile image
router.post('/:id/profile-image', protect, roleAuthorize('admin', 'manager'), upload.single('profileImage'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    employee.profileImage = req.file.path;
    await employee.save();
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
