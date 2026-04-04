// src/components/ui/InlineProjectForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, DollarSign, Link as LinkIcon, Users, Plus, Trash2, UserPlus, Search, Check } from 'lucide-react';
import apiClient from 'api/client';
import { toast } from 'react-hot-toast';
import useAuthStore from 'store/useAuthStore';

const InlineProjectForm = ({ client, onClose, onSubmit, isSubmitting }) => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    assigningDate: '',
    deadline: '',
    phase: 'Planning',
    status: 'active',
    totalPayment: '',
    paymentReceived: '',
    budget: '',
    githubLink: '',
    deploymentLink: '',
    contactInfo: client?.phone || '',
    assignedEmployees: []
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    
    try {
      const response = await apiClient.get('/employees');
      
      let employeesArray = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        employeesArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeesArray = response.data;
      }
      
      // Clean each employee - extract from user object
      const cleanedEmployees = employeesArray.map(emp => {
        const userData = emp.user || {};
        
        // Get name from user object
        let employeeName = userData.name || userData.firstName || '';
        if (employeeName && userData.lastName) {
          employeeName = `${userData.firstName} ${userData.lastName}`;
        }
        
        // Get email from user object
        const employeeEmail = userData.email || '';
        
        // Get role
        let employeeRole = 'Team Member';
        if (emp.role) {
          if (typeof emp.role === 'string') {
            employeeRole = emp.role;
          } else if (typeof emp.role === 'object' && emp.role.name) {
            employeeRole = emp.role.name;
          }
        }
        
        // Get department
        let employeeDepartment = '';
        if (emp.department) {
          if (typeof emp.department === 'string') {
            employeeDepartment = emp.department;
          } else if (typeof emp.department === 'object' && emp.department.name) {
            employeeDepartment = emp.department.name;
          }
        }
        
        return {
          id: emp.id,
          name: employeeName || 'Unknown',
          email: employeeEmail || '',
          role: employeeRole,
          department: employeeDepartment,
          status: emp.status || 'active'
        };
      });
      
      // Filter only active employees with valid names
      const activeEmployees = cleanedEmployees.filter(emp => 
        emp.name !== 'Unknown' && emp.name !== '' && emp.name !== null
      );
      
      setEmployees(activeEmployees);
      setFilteredEmployees(activeEmployees);
      
      if (activeEmployees.length === 0) {
        toast.error("No active employees found");
      } else {
        toast.success(`Loaded ${activeEmployees.length} employees`);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Filter employees based on search term
  useEffect(() => {
    if (employeeSearchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const searchLower = employeeSearchTerm.toLowerCase();
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower)
      );
      setFilteredEmployees(filtered);
    }
  }, [employeeSearchTerm, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = (employee) => {
    if (!formData.assignedEmployees.find(emp => emp.id === employee.id)) {
      setFormData(prev => ({
        ...prev,
        assignedEmployees: [...prev.assignedEmployees, employee]
      }));
      toast.success(`${employee.name} added to project`);
    }
    setShowEmployeeDropdown(false);
    setEmployeeSearchTerm('');
  };

  const handleRemoveEmployee = (employeeId) => {
    const removedEmployee = formData.assignedEmployees.find(emp => emp.id === employeeId);
    setFormData(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.filter(emp => emp.id !== employeeId)
    }));
    if (removedEmployee) {
      toast.success(`${removedEmployee.name} removed from project`);
    }
  };

  // FIXED: Handle submit with proper null values for dates
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const assignedEmployeeIds = formData.assignedEmployees.map(emp => emp.id);
    
    // Convert empty strings to null for date fields
    const assigningDate = formData.assigningDate && formData.assigningDate.trim() !== '' 
      ? formData.assigningDate 
      : null;
    
    const deadline = formData.deadline && formData.deadline.trim() !== '' 
      ? formData.deadline 
      : null;
    
    const submitData = {
      projectName: formData.projectName,
      description: formData.description || null,
      assigningDate: assigningDate,
      deadline: deadline,
      phase: formData.phase,
      status: formData.status,
      totalPayment: Number(formData.totalPayment) || 0,
      paymentReceived: Number(formData.paymentReceived) || 0,
      budget: Number(formData.budget) || 0,
      githubLink: formData.githubLink || null,
      deploymentLink: formData.deploymentLink || null,
      contactInfo: formData.contactInfo || null,
      clientEmail: client.email,
      clientName: client.name,
      assignedEmployees: assignedEmployeeIds,
      companyId: user?.company?.id
    };
    
    console.log("Submitting project data:", submitData);
    onSubmit(submitData);
  };

  const getInitials = (name) => {
    if (!name || name === 'Unknown') return '?';
    const parts = String(name).split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getEmployeeColor = (name) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#10b981', '#14b8a6', '#06b6d4',
      '#0ea5e9', '#3b82f6'
    ];
    
    const nameStr = String(name || '');
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = ((hash << 5) - hash) + nameStr.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Add New Project</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Client: <span className="font-semibold">{client?.name || 'N/A'}</span> ({client?.email || 'N/A'})
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors">
            <X size={18}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name *</label>
            <input
              type="text"
              name="projectName"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Enter project name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={12} /> Start Date
              </label>
              <input
                type="date"
                name="assigningDate"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.assigningDate}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-400 mt-1">Optional</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock size={12} /> Deadline
              </label>
              <input
                type="date"
                name="deadline"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.deadline}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-400 mt-1">Optional</p>
            </div>
          </div>

          {/* Phase & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phase</label>
              <select
                name="phase"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phase}
                onChange={handleChange}
              >
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Deployment">Deployment</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                name="status"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Assigned Employees Section */}
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                <Users size={12} /> Assigned Team Members ({formData.assignedEmployees.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                className="text-purple-600 hover:text-purple-700 text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <UserPlus size={12} /> Add Member
              </button>
            </div>

            {/* Employee Selection Dropdown */}
            {showEmployeeDropdown && (
              <div className="mb-3 bg-white rounded-lg border border-purple-200 shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-purple-600" />
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <Users size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No employees found</p>
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const isAlreadyAssigned = formData.assignedEmployees.some(emp => emp.id === employee.id);
                      return (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => !isAlreadyAssigned && handleAddEmployee(employee)}
                          disabled={isAlreadyAssigned}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0 ${
                            isAlreadyAssigned ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                            style={{ backgroundColor: getEmployeeColor(employee.name) }}
                          >
                            {getInitials(employee.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {employee.role} • {employee.email}
                            </p>
                          </div>
                          {isAlreadyAssigned && (
                            <Check size={14} className="text-green-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Assigned Employees List */}
            {formData.assignedEmployees.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.assignedEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: getEmployeeColor(employee.name) }}
                      >
                        {getInitials(employee.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{employee.name}</p>
                        <p className="text-xs text-gray-500 truncate">{employee.role} • {employee.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.assignedEmployees.length === 0 && !showEmployeeDropdown && !isLoadingEmployees && (
              <div className="text-center py-4">
                <Users size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500">No team members assigned yet</p>
                <button
                  type="button"
                  onClick={() => setShowEmployeeDropdown(true)}
                  className="mt-2 text-purple-600 hover:text-purple-700 text-xs flex items-center gap-1 mx-auto"
                >
                  <Plus size={12} /> Add team members
                </button>
              </div>
            )}
          </div>

          {/* Financial */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <DollarSign size={12} /> Financial Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  name="budget"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Payment (₹)</label>
                <input
                  type="number"
                  name="totalPayment"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.totalPayment}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Received (₹)</label>
                <input
                  type="number"
                  name="paymentReceived"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.paymentReceived}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Info</label>
                <input
                  type="text"
                  name="contactInfo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <LinkIcon size={12} /> Project Links
            </h4>
            <div className="space-y-2">
              <input
                type="url"
                name="githubLink"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.githubLink}
                onChange={handleChange}
                placeholder="GitHub URL"
              />
              <input
                type="url"
                name="deploymentLink"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.deploymentLink}
                onChange={handleChange}
                placeholder="Deployment URL"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InlineProjectForm;