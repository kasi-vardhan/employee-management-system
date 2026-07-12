import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Plus, Edit2, Trash2, Building2, Users, Download } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setError(null);
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (error) {
      setError('Failed to fetch departments');
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', formData);
        toast.success('Department added successfully');
      }
      setShowModal(false);
      setEditingDept(null);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      head: dept.head || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      head: ''
    });
  };

  const openModal = () => {
    resetForm();
    setEditingDept(null);
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading departments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDepartments} />;
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/departments/export/csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'departments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Departments exported successfully');
    } catch (error) {
      toast.error('Failed to export departments');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Departments</h2>
        <div className="flex gap-2">
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
            <Plus size={20} />
            Add Department
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-blue-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{dept.name}</h3>
              {dept.description && (
                <p className="text-gray-500 text-sm mb-4">{dept.description}</p>
              )}
              {dept.head && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>Head: {dept.head}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No departments found. Add your first department to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({
                    ...formData, name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({
                    ...formData, description: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows="3"
                  placeholder="Brief description of the department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Head</label>
                <input
                  type="text"
                  value={formData.head}
                  onChange={(e) => setFormData({
                    ...formData, head: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDept(null);
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
                  {editingDept ? 'Update' : 'Add'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
