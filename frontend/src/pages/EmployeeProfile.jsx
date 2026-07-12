import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      setError(null);
      const [empRes, attRes, leavesRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get(`/attendance/employee/${id}`),
        api.get(`/leaves/employee/${id}`)
      ]);
      
      setEmployee(empRes.data.data);
      setAttendance(attRes.data.data || []);
      setLeaves(leavesRes.data.data || []);
    } catch (error) {
      setError('Failed to fetch employee data');
      toast.error('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const late = attendance.filter(a => a.status === 'Late').length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, late, total, percentage };
  };

  const calculateLeaveStats = () => {
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    const total = leaves.length;
    
    return { approved, pending, rejected, total };
  };

  if (loading) {
    return <LoadingSpinner text="Loading employee profile..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchEmployeeData} />;
  }

  if (!employee) {
    return <ErrorMessage message="Employee not found" />;
  }

  const attStats = calculateAttendanceStats();
  const leaveStats = calculateLeaveStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employee Profile</h1>
      </div>

      {/* Employee Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold flex-shrink-0">
            {employee.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{employee.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{employee.designation}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Employee ID</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{employee.employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{employee.department?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">${employee.salary?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Attendance Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{attStats.present}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{attStats.absent}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-yellow-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{attStats.late}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Attendance %</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{attStats.percentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Leave Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{leaveStats.approved}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-yellow-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{leaveStats.pending}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{leaveStats.rejected}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className="text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{leaveStats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b dark:border-gray-700">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Attendance History
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'leaves'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Leave History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'attendance' && (
            <div>
              {attendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check In</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {attendance.map((att) => (
                        <tr key={att._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-gray-800 dark:text-white">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              att.status === 'Present' ? 'bg-green-100 text-green-700' :
                              att.status === 'Absent' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{att.checkIn || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{att.checkOut || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{att.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No attendance records found</p>
              )}
            </div>
          )}

          {activeTab === 'leaves' && (
            <div>
              {leaves.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-gray-800 dark:text-white">{leave.type}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {new Date(leave.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {new Date(leave.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{leave.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No leave requests found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
