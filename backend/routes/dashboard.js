const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { protect } = require('../middleware/auth');
const { getCache, setCache, deleteCachePattern } = require('../config/redis');

// Get dashboard statistics
router.get('/stats', protect, async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `dashboard:stats:${req.user.id}`;
    const cachedStats = await getCache(cacheKey);
    
    if (cachedStats) {
      return res.json({
        success: true,
        data: cachedStats,
        cached: true
      });
    }

    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalDepartments = await Department.countDocuments();
    
    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const presentToday = await Attendance.countDocuments({ 
      date: today, 
      status: 'Present' 
    });
    
    // Employees on leave today
    const onLeaveToday = await Leave.countDocuments({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'Approved'
    });
    
    // Recent employees (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEmployees = await Employee.find({
      createdAt: { $gte: sevenDaysAgo }
    }).select('name email designation createdAt').limit(5);
    
    // Department-wise employee count
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { 
          _id: '$department', 
          count: { $sum: 1 } 
        } },
      { $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        } },
      { $unwind: '$department' },
      { $project: {
          name: '$department.name',
          count: 1
        } }
    ]);
    
    // Attendance stats for the last 7 days
    const attendanceSevenDaysAgo = new Date();
    attendanceSevenDaysAgo.setDate(attendanceSevenDaysAgo.getDate() - 7);
    
    const attendanceStats = await Attendance.aggregate([
      { $match: { date: { $gte: attendanceSevenDaysAgo } } },
      { $group: {
          _id: '$date',
          date: { $first: '$date' },
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } }
        } },
      { $sort: { date: 1 } },
      { $project: {
          _id: 0,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: 1,
          absent: 1,
          late: 1
        } }
    ]);
    
    // Pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        presentToday,
        onLeaveToday,
        pendingLeaves,
        recentEmployees,
        departmentStats,
        attendanceStats
      }
    });
    
    // Cache the results for 5 minutes
    await setCache(cacheKey, {
      totalEmployees,
      totalDepartments,
      presentToday,
      onLeaveToday,
      pendingLeaves,
      recentEmployees,
      departmentStats,
      attendanceStats
    }, 300);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
