import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Calendar, Check, X, Clock, User, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '',
    checkOut: '',
    notes: ''
  });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      setError(null);
      const response = await api.get(`/attendance?month=${selectedMonth}&year=${selectedYear}`);
      setAttendance(response.data.data);
    } catch (error) {
      setError('Failed to fetch attendance');
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      toast.success('Attendance marked successfully');
      setShowModal(false);
      resetForm();
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/attendance/${id}`);
        toast.success('Attendance record deleted');
        fetchAttendance();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      checkIn: '',
      checkOut: '',
      notes: ''
    });
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading attendance..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAttendance} />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700';
      case 'Absent': return 'bg-red-100 text-red-700';
      case 'Late': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <Check size={16} />;
      case 'Absent': return <X size={16} />;
      case 'Late': return <Clock size={16} />;
      default: return null;
    }
  };

  const getAttendanceForDate = (date) => {
    return attendance.find(a => new Date(a.date).toDateString() === date.toDateString());
  };

  const renderCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const att = getAttendanceForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          className={`p-2 min-h-[80px] border border-gray-200 dark:border-gray-700 rounded-lg ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">{day}</div>
          {att && (
            <div className={`p-1 rounded text-xs ${
              att.status === 'Present' ? 'bg-green-100 text-green-700' :
              att.status === 'Absent' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {att.employee?.name?.split(' ')[0] || 'Unknown'}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/attendance/export/csv', {
        responseType: 'blob',
        params: { month: selectedMonth, year: selectedYear }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Attendance exported successfully');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {viewMode === 'table' ? <Calendar size={20} /> : <User size={20} />}
            {viewMode === 'table' ? 'Calendar View' : 'Table View'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Calendar size={20} />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (selectedMonth === 1) {
                  setSelectedMonth(12);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                if (selectedMonth === 12) {
                  setSelectedMonth(1);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ChevronRight size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{record.employee?.name}</p>
                          <p className="text-sm text-gray-500">{record.employee?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.checkIn || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{record.checkOut || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No attendance records found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  required
                  value={formData.employee}
                  onChange={(e) => setFormData({
                    ...formData, employee: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} - {emp.employeeId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({
                    ...formData, date: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({
                    ...formData, status: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
                  <input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({
                      ...formData, checkIn: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
                  <input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({
                      ...formData, checkOut: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({
                    ...formData, notes: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows="2"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
