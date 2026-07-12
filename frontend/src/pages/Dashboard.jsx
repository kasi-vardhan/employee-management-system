import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  FileText,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      setError('Failed to fetch dashboard stats');
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchStats} />;
  }

  const statCards = [
    { 
      title: 'Total Employees', 
      value: stats?.totalEmployees || 0, 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Departments', 
      value: stats?.totalDepartments || 0, 
      icon: Building2, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Present Today', 
      value: stats?.presentToday || 0, 
      icon: CalendarCheck, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'On Leave', 
      value: stats?.onLeaveToday || 0, 
      icon: FileText, 
      color: 'bg-orange-500' 
    },
  ];

  // Prepare chart data
  const departmentData = stats?.departmentStats || [];
  const attendanceData = stats?.attendanceStats || [];
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-full`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Leaves */}
      {stats?.pendingLeaves > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-orange-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pending Leave Requests</h3>
          </div>
          <p className="text-3xl font-bold text-orange-500">{stats.pendingLeaves}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Requests awaiting approval</p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Department Overview</h3>
          </div>
          
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No department data available</p>
          )}
        </div>

        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <CalendarCheck className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Attendance Overview</h3>
          </div>
          
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                <Bar dataKey="late" fill="#F59E0B" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No attendance data available</p>
          )}
        </div>
      </div>

      {/* Department Stats Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="text-blue-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Department Details</h3>
        </div>
        
        {stats?.departmentStats?.length > 0 ? (
          <div className="space-y-4">
            {stats.departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{dept.departmentName}</p>
                    <p className="text-sm text-gray-500">Department</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{dept.count}</p>
                  <p className="text-sm text-gray-500">Employees</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No departments found</p>
        )}
      </div>

      {/* Recent Employees */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="text-green-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Recent Employees</h3>
        </div>
        
        {stats?.recentEmployees?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentEmployees.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.designation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent employees</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
