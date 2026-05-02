import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import useAuthStore from '../../../store/useAuthStore';
import axios from 'axios';

const EmployeeModal = ({
  isOpen,
  onClose,
  employee,
  mode, // 'view', 'edit', 'add'
  onSave
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    roleIds: [],
    permissionIds: [], // Added for direct permissions
    employmentType: '',
    status: 'active',
    hireDate: '',
    manager: '',
    branch: '',
    salary: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    skills: [],
    avatar: '',
    checkInTime: '',
    startTime: '',
    endTime: '',
    documents: [] // Added for document management
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [permissionsLoading, setPermissionsLoading] = useState(false); // Track permissions fetch
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]); // All possible system permissions
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);

  // Refs for file uploads
  const avatarInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (employee && mode !== 'add') {
      setFormData({
        firstName: employee?.firstName || '',
        lastName: employee?.lastName || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        department: employee?.departmentId || '',
        designationId: employee?.designationId || '',
        roleIds: employee?.roleIds || [],
        permissionIds: employee?.permissionIds || [], // Direct permissions from transformed employee
        employmentType: employee?.employmentType || '',
        status: employee?.status || 'active',
        hireDate: employee?.hireDate || '',
        manager: employee?.manager || '',
        branch: employee?.branch || '',
        salary: employee?.salary || '',
        address: employee?.address || '',
        emergencyContact: employee?.emergencyContact || '',
        emergencyPhone: employee?.emergencyPhone || '',
        skills: employee?.skills || [],
        avatar: employee?.avatar || '',
        checkInTime: employee?.checkInTime || '',
        startTime: employee?.startTime || '',
        endTime: employee?.endTime || '',
        customDesignation: '',
        documents: employee?.documents || [] // Load existing docs
      });
    } else if (mode === 'add') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designationId: '',
        customDesignation: '',
        roleIds: [],
        permissionIds: [],
        employmentType: 'full-time',
        status: 'active',
        hireDate: new Date()?.toISOString()?.split('T')?.[0],
        manager: '',
        branch: '',
        salary: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        skills: [],
        avatar: '',
        profileImage: '',
        checkInTime: '',
        startTime: '09:00',
        endTime: '18:00',
        employeeType: 'office',
        workFromHome: false,
        documents: []
      });
    }
  }, [employee, mode]);

  useEffect(() => {
    const fetchData = async () => {
      setPermissionsLoading(true);
      try {
        const [deptRes, roleRes, designRes, permissionRes, employeeRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.DEPARTMENTS.BASE),
          apiClient.get(API_ENDPOINTS.ACCESS_CONTROL.ROLES, { params: { companyId: currentUser?.company?.id } }),
          apiClient.get(API_ENDPOINTS.DESIGNATIONS.BASE, { params: { companyId: currentUser?.company?.id } }),
          apiClient.get(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS),
          apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE, { params: { companyId: currentUser?.company?.id } })
        ]);

        const rolesData = roleRes.data?.data || roleRes.data || [];
        setRoles(rolesData);

        const designsData = designRes.data?.data || designRes.data || [];
        const fetchedDesignations = designsData.map(d => ({ value: d.id, label: d.name }));

        // Add requested designations as defaults if not already present
        const requestedDesignations = [
          'Software Engineer',
          'DevOps Engineer',
          'Software Tester',
          'UI & UX Designer'
        ];

        const finalDesignations = [...fetchedDesignations];
        requestedDesignations.forEach(name => {
          if (!fetchedDesignations.some(d => d.label === name)) {
            finalDesignations.push({ value: name, label: name });
          }
        });

        // Add "Other" option
        finalDesignations.push({ value: 'other', label: 'Other' });

        setDesignations(finalDesignations);

        const deptsData = deptRes.data?.data || deptRes.data || [];
        setDepartments(deptsData.map(d => ({ value: d.id, label: d.name })));

        const employeesData = employeeRes.data?.data || employeeRes.data || [];
        // Filter for managers only (role designation)
        const managersList = employeesData
          .filter(emp =>
            emp.user?.roles?.some(r => r.name?.toLowerCase() === 'manager') ||
            emp.role?.toLowerCase() === 'manager'
          )
          .map(emp => ({
            value: `${emp.user?.firstName} ${emp.user?.lastName}`,
            label: `${emp.user?.firstName} ${emp.user?.lastName}`
          }));
        setAvailableManagers(managersList);

        // --- DEDUPLICATION LOGIC ---
        const rawPerms = permissionRes.data?.data || permissionRes.data || [];
        const uniquePermissions = [];
        const seen = new Set();

        rawPerms.forEach(perm => {
          // Combine resource and action to create a unique key
          const identifier = `${perm.resource}:${perm.action}`;

          if (!seen.has(identifier)) {
            seen.add(identifier);
            uniquePermissions.push(perm);
          }
        });

        // Set only the unique list to state
        setAvailablePermissions(uniquePermissions);

      } catch (error) {
        console.error('Failed to fetch modal data:', error);
      } finally {
        setPermissionsLoading(false);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen, currentUser]);

  //  File Handling Logic
  const handleFileChange = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (type === 'profileImage') setUploadingProfile(true);
    else if (type === 'doc') setUploadingDocs(true);
    setIsLoading(true);

    try {
      const file = files[0];
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await apiClient.post(API_ENDPOINTS.UPLOAD_IMAGE.IMAGE, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Safety check for URL extraction at various depths
      const uploadedUrl = res.data?.url || res.data?.data?.url || res.data?.data?.data?.url;

      console.log("Extracted URL:", uploadedUrl);

      if (!uploadedUrl) {
        console.error("Structure check - res.data is:", res.data);
        throw new Error("No URL returned from server");
      }

      if (type === "profileImage") {
        setFormData(prev => ({
          ...prev,
          avatar: uploadedUrl
        }));
      } else if (type === "doc") {
        const newDoc = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          url: uploadedUrl,
          publicId: res.data?.public_id || undefined
        };

        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, newDoc]
        }));
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`${type} upload failed:`, errorMsg);
    } finally {
      setIsLoading(false);
      setUploadingProfile(false);
      setUploadingDocs(false);
      if (e.target) e.target.value = null;
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'User' },
    { id: 'employment', label: 'Roles & Employment', icon: 'Shield' },
    { id: 'permissions', label: 'Permissions', icon: 'Lock' },
    { id: 'contact', label: 'Contact', icon: 'Phone' },
    { id: 'documents', label: 'Documents', icon: 'FileText' }
  ];

  const employmentTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
    { value: 'consultant', label: 'Consultant' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'terminated', label: 'Terminated' }
  ];

  const branchOptions = [
    { value: 'headquarters', label: 'Headquarters' },
    { value: 'new-york', label: 'New York Office' },
    { value: 'san-francisco', label: 'San Francisco Office' },
    { value: 'london', label: 'London Office' },
    { value: 'singapore', label: 'Singapore Office' },
    { value: 'remote', label: 'Remote' }
  ];


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };



  const validateForm = () => {
    const newErrors = {};
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (!formData?.department) newErrors.department = 'Department is required';
    if (!formData?.roleIds || formData.roleIds.length === 0) newErrors.roleIds = 'System role is required';
    if (!formData?.hireDate) newErrors.hireDate = 'Hire date is required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setApiError('');
    setIsSaving(true);
    setIsLoading(true);
    try {
      const finalDesignationId = formData.designationId === 'other' ? formData.customDesignation : formData.designationId;

      const employeeData = {
        ...formData,
        designationId: finalDesignationId,
        name: `${formData?.firstName} ${formData?.lastName}`?.trim(),
        id: employee?.id || Date.now()
      };
      await onSave(employeeData);
      onClose();
    } catch (error) {
      setApiError(error?.message || 'Failed to save employee. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';
  const modalTitle = mode === 'add' ? 'Add New Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Details';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-none md:rounded-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden text-slate-900 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Icon name="User" size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{modalTitle}</h2>
              {employee && <p className="text-xs font-semibold text-slate-400 mt-0.5">ID: {employee?.id || employee?._id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-xl border border-slate-100">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Side Tabs - Modern Style */}
          <div className="w-full md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
            <div className="p-4 md:p-5 border-b border-slate-100 hidden md:block">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Information Sections</p>
            </div>
            <nav className="flex md:flex-col p-2 md:p-3 space-y-0 md:space-y-1 space-x-2 md:space-x-0 overflow-x-auto md:overflow-x-visible no-scrollbar">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex-shrink-0 md:flex-shrink-1 flex items-center space-x-3 px-4 py-2.5 md:py-3 text-left text-xs md:text-sm font-semibold rounded-xl transition-all ${activeTab === tab?.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 md:border-transparent'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
              {activeTab === 'basic' && (
                <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 pb-6 md:pb-10 border-b border-slate-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-50 flex-shrink-0 border-4 border-white shadow-md ring-1 ring-slate-200 p-1 relative">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                          <img
                            src={formData?.avatar || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                          {uploadingProfile && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {(mode === 'edit' || mode === 'add') && (
                        <button
                          onClick={() => avatarInputRef.current.click()}
                          className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all border-2 border-white shadow-lg"
                        >
                          <Icon name="Camera" size={16} />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-4">Profile Picture</h3>
                      {(mode === 'edit' || mode === 'add') && (
                        <div className="space-y-3">
                          <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'profileImage')} />
                          <button
                            onClick={() => avatarInputRef.current.click()}
                            className="px-5 py-2 bg-white border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                          >
                            Upload Photo
                          </button>
                          <p className="text-[11px] text-slate-400 font-medium tracking-tight">JPG, PNG or GIF. Max size of 2MB.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">First Name</label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        value={formData?.firstName} onChange={(e) => handleInputChange('firstName', e?.target?.value)} disabled={isReadOnly}
                      />
                      {errors?.firstName && <p className="text-xs text-rose-500 font-medium ml-1">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Last Name</label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        value={formData?.lastName} onChange={(e) => handleInputChange('lastName', e?.target?.value)} disabled={isReadOnly}
                      />
                      {errors?.lastName && <p className="text-xs text-rose-500 font-medium ml-1">{errors.lastName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Email Address</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        value={formData?.email} onChange={(e) => handleInputChange('email', e?.target?.value)} disabled={isReadOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        value={formData?.phone} onChange={(e) => handleInputChange('phone', e?.target?.value)} disabled={isReadOnly}
                      />
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 ml-1 mb-2 block">Skills & Competencies</label>
                    <textarea
                      placeholder="Enter skills separated by commas..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[100px] resize-none"
                      value={formData?.skills?.join(', ')}
                      onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[
                      { label: 'Department', key: 'department', options: departments },
                      { label: 'Designation', key: 'designationId', options: designations },
                      { label: 'Employment Type', key: 'employmentType', options: employmentTypeOptions },
                      { label: 'Status', key: 'status', options: statusOptions },
                      { label: 'Branch', key: 'branch', options: branchOptions },
                      { label: 'Manager', key: 'manager', options: availableManagers }
                    ].map((f, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 ml-1">{f.label}</label>
                        <div className="relative">
                          <select
                            value={formData[f.key]}
                            onChange={(e) => handleInputChange(f.key, e.target.value)}
                            disabled={isReadOnly}
                            className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all cursor-pointer"
                          >
                            <option value="">Select {f.label}</option>
                            {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Icon name="ChevronDown" size={14} />
                          </div>
                        </div>

                        {/* Show custom designation input if "other" is selected */}
                        {f.key === 'designationId' && formData.designationId === 'other' && (
                          <div className="mt-3 animate-in slide-in-from-top-1 duration-200">
                            <input
                              type="text"
                              placeholder="Enter custom designation..."
                              className="w-full px-4 py-2.5 bg-white border border-blue-200 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                              value={formData.customDesignation || ''}
                              onChange={(e) => handleInputChange('customDesignation', e.target.value)}
                              disabled={isReadOnly}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Hire Date</label>
                      <input type="date" value={formData?.hireDate} onChange={(e) => handleInputChange('hireDate', e?.target?.value)} disabled={isReadOnly} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Salary</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">INR</span>
                        <input type="number" value={formData?.salary} onChange={(e) => handleInputChange('salary', e?.target?.value)} disabled={isReadOnly} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
                      </div>
                    </div>

                    {/* Employee Type & WFH */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Work Setting</label>
                      <div className="flex space-x-4 pt-1">
                        {['office', 'field', 'remote'].map((type) => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="employeeType"
                              value={type}
                              checked={formData.employeeType === type}
                              onChange={(e) => handleInputChange('employeeType', e.target.value)}
                              disabled={isReadOnly}
                              className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-100 transition-all"
                            />
                            <span className="text-xs font-semibold capitalize text-slate-600 group-hover:text-slate-900">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Work From Home</label>
                      <div className="flex items-center space-x-3 pt-1">
                        <button
                          disabled={isReadOnly}
                          onClick={() => handleInputChange('workFromHome', !formData.workFromHome)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${formData.workFromHome ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${formData.workFromHome ? 'translate-x-5.5' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs font-semibold text-slate-600">{formData.workFromHome ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>

                    {/* Working Hours - Added Square Styling */}
                    <div className="col-span-1 md:col-span-2 pt-4">
                      <div className="bg-slate-50 border border-slate-200 p-6 rounded-none space-y-6">
                        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-none border border-blue-200">
                            <Icon name="Clock" size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Employee Working Hours</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Define the daily schedule for this employee</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-0.5">Start Time</label>
                            <div className="relative group">
                              <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => handleInputChange('startTime', e.target.value)}
                                disabled={isReadOnly}
                                className="w-full px-4 py-3 bg-white border border-slate-200 text-sm font-bold rounded-none focus:ring-0 focus:border-blue-500 outline-none transition-all hover:border-slate-300"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-blue-500 transition-colors">
                                <Icon name="LogIn" size={14} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-0.5">End Time</label>
                            <div className="relative group">
                              <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => handleInputChange('endTime', e.target.value)}
                                disabled={isReadOnly}
                                className="w-full px-4 py-3 bg-white border border-slate-200 text-sm font-bold rounded-none focus:ring-0 focus:border-blue-500 outline-none transition-all hover:border-slate-300"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-blue-500 transition-colors">
                                <Icon name="LogOut" size={14} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Roles */}
                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 ml-1 mb-4 block">System Authorization Roles</label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {roles.map(role => {
                        const isSelected = formData.roleIds.includes(role.id);
                        return (
                          <button
                            key={role.id} type="button" onClick={(e) => {
                              e.preventDefault();
                              if (isReadOnly) return;
                              const newRoles = isSelected ? formData.roleIds.filter(id => id !== role.id) : [...formData.roleIds, role.id];
                              handleInputChange('roleIds', newRoles);
                            }}
                            className={`flex items-center space-x-3 p-4 border transition-all rounded-xl text-left ${isSelected
                              ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                              }`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-300'}`}>
                              {isSelected && <Icon name="Check" size={10} className="text-white" />}
                            </div>
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{role.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 mb-6 group hover:shadow-xl transition-all">
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">Access Privilege Matrix</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">Direct system overrides and inherited permissions</p>
                    </div>
                    <div className="bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 flex items-center space-x-3">
                      <span className="text-2xl font-bold font-mono text-blue-400">{formData.permissionIds.length.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overrides</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(
                      availablePermissions.reduce((acc, perm) => {
                        if (!acc[perm.resource]) acc[perm.resource] = [];
                        acc[perm.resource].push(perm);
                        return acc;
                      }, {})
                    ).map(([resource, perms], idx) => {
                      const inheritedPermIds = roles
                        .filter(r => formData.roleIds.includes(r.id))
                        .flatMap(r => r.permissions || [])
                        .filter(p => p.resource === resource)
                        .map(p => p.id);

                      return (
                        <div key={idx} className="border border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                          <div className="px-5 py-3 bg-white border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 tracking-tight uppercase">{resource}</span>
                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                              <Icon name="Database" size={14} className="text-slate-400 group-hover:text-blue-500" />
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-2.5">
                            {perms.sort((a, b) => a.action.localeCompare(b.action)).map((perm) => {
                              const isInherited = inheritedPermIds.includes(perm.id);
                              const isDirect = formData.permissionIds.includes(perm.id);
                              return (
                                <button
                                  key={perm.id}
                                  type="button"
                                  disabled={isInherited || isReadOnly}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newPerms = isDirect ? formData.permissionIds.filter(id => id !== perm.id) : [...formData.permissionIds, perm.id];
                                    handleInputChange('permissionIds', newPerms);
                                  }}
                                  className={`flex items-center space-x-2.5 px-3 py-2 border transition-all rounded-lg text-left ${isInherited ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                    isDirect ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-100' :
                                      'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                    }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${isInherited ? 'bg-emerald-500' : isDirect ? 'bg-white' : 'bg-slate-300'}`}></div>
                                  <span className="text-[10px] font-bold capitalize">{perm.action}</span>
                                  {isInherited && <Icon name="Shield" size={10} className="ml-auto opacity-40 text-emerald-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Home Address</label>
                    <textarea
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[100px] resize-none"
                      value={formData?.address} onChange={(e) => handleInputChange('address', e?.target?.value)} disabled={isReadOnly}
                      placeholder="Enter full street, city, and zip code..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Emergency Contact Person</label>
                      <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" value={formData?.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)} disabled={isReadOnly} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Emergency Phone Number</label>
                      <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" value={formData?.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)} disabled={isReadOnly} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {(mode === 'edit' || mode === 'add') && (
                    <div
                      onClick={() => !uploadingDocs && docInputRef.current.click()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center group transition-all ${uploadingDocs
                        ? 'border-blue-400 bg-blue-50/30 cursor-wait'
                        : 'border-slate-200 bg-slate-50 cursor-pointer hover:bg-blue-50/50 hover:border-blue-400'
                        }`}
                    >
                      <input type="file" multiple hidden ref={docInputRef} onChange={(e) => handleFileChange(e, 'doc')} disabled={uploadingDocs} />
                      {uploadingDocs ? (
                        <div className="space-y-4 py-2 animate-in fade-in duration-300">
                          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto shadow-md"></div>
                          <p className="text-sm font-bold text-blue-600 tracking-tight">Processing your files...</p>
                          <p className="text-[10px] text-slate-400 font-medium">Please wait a moment</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm group-hover:text-blue-500 group-hover:scale-110 transition-all">
                            <Icon name="UploadCloud" size={32} />
                          </div>
                          <span className="block text-sm font-bold text-slate-800 tracking-tight transition-colors">Upload Documents</span>
                          <p className="text-xs text-slate-400 font-medium mt-2">PDF, DOCX or Images up to 10MB per file</p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Attached Files ({formData.documents.length})</span>
                      <Icon name="Files" size={16} className="text-slate-300" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                          <div className="flex items-center space-x-4 overflow-hidden">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <Icon name="FileText" size={18} />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{doc.name}</p>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">{doc.size}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => window.open(doc.url)} className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all text-slate-500"><Icon name="Download" size={14} /></button>
                            {!isReadOnly && <button onClick={() => removeDocument(idx)} className="p-2 border border-rose-50 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"><Icon name="Trash2" size={14} /></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {apiError && (
              <div className="mx-4 md:mx-8 mt-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <Icon name="AlertCircle" size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}
            <div className="px-4 md:px-8 py-4 md:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 hidden md:flex">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-50 bg-slate-200" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Collaborating with the HR team</span>
              </div>
              <div className="flex space-x-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  Cancel
                </button>
                {(mode === 'edit' || mode === 'add') && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className={`flex-1 md:flex-none px-8 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center space-x-2 min-w-[140px] justify-center ${isSaving || isLoading
                      ? 'bg-blue-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                      }`}
                  >
                    {(isSaving || isLoading) && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>{isSaving ? 'Processing...' : (mode === 'add' ? 'Create' : 'Save')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;