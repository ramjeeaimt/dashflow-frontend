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
    profileImage:'',
    checkInTime: '',
    documents: [] // Added for document management
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false); // Track permissions fetch
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]); // All possible system permissions
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

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
        profileImage: employee?.profileImage || '',
        checkInTime: employee?.checkInTime || '',
        documents: employee?.documents || [] // Load existing docs
      });
    } else if (mode === 'add') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
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
        profileImage:'',
        checkInTime: '',
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
        const [deptRes, roleRes, designRes, permissionRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.DEPARTMENTS.BASE),
          apiClient.get(API_ENDPOINTS.ACCESS_CONTROL.ROLES, { params: { companyId: currentUser?.company?.id } }),
          apiClient.get(API_ENDPOINTS.DESIGNATIONS.BASE, { params: { companyId: currentUser?.company?.id } }),
          apiClient.get(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS)
        ]);

        const rolesData = roleRes.data?.data || roleRes.data || [];
        setRoles(rolesData);

        const designsData = designRes.data?.data || designRes.data || [];
        setDesignations(designsData.map(d => ({ value: d.id, label: d.name })));

        const deptsData = deptRes.data?.data || deptRes.data || [];
        setDepartments(deptsData.map(d => ({ value: d.id, label: d.name })));

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

  setIsLoading(true);

  try {
    const file = files[0];
    const formDataUpload = new FormData();
    formDataUpload.append("file", file); 

    const res = await apiClient.post(API_ENDPOINTS.UPLOAD_IMAGE.IMAGE, formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // --- NEW EXTRACTION LOGIC BASED ON YOUR LOG ---
    // Layer 1: Axios wrapper (res.data)
    // Layer 2: Interceptor wrapper (res.data.data)
    // Layer 3: Controller wrapper (res.data.data.data)
    
    const interceptorData = res.data?.data;
    const controllerData = interceptorData?.data;
    const uploadedUrl = controllerData?.url;

    console.log("Deeply nested URL check:", uploadedUrl);

    if (!uploadedUrl) {
      console.error("Structure check - res.data is:", res.data);
      throw new Error("No URL returned from server");
    }

    if (type === "profileImage") {
      setFormData(prev => ({
        ...prev,
        profileImage: uploadedUrl,
        avatar: uploadedUrl 
      }));
    } else if (type === "doc") {
      const newDoc = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: uploadedUrl,
        publicId: controllerData?.public_id
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

  const managerOptions = [
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'michael-chen', label: 'Michael Chen' },
    { value: 'emily-davis', label: 'Emily Davis' },
    { value: 'david-wilson', label: 'David Wilson' },
    { value: 'lisa-anderson', label: 'Lisa Anderson' }
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
    setIsLoading(true);
    try {
      const employeeData = {
        ...formData,
        name: `${formData?.firstName} ${formData?.lastName}`?.trim(),
        id: employee?.id || Date.now()
      };
      await onSave(employeeData);
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';
  const modalTitle = mode === 'add' ? 'Add New Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Details';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-900 rounded-none w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden text-slate-900 shadow-[20px_20px_0px_rgba(15,23,42,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-slate-900 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-none bg-white/10 flex items-center justify-center border border-white/20">
              <Icon name="User" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest">{modalTitle}</h2>
              {employee && <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1 italic">OBJECT_REFERENCE: {employee?.id || employee?._id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors rounded-none border border-transparent hover:border-white/20">
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Side Tabs - Industrial Style */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation Layers</p>
            </div>
            <nav className="flex-1">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-4 text-left text-xs font-black uppercase tracking-widest transition-all border-b border-slate-100 ${
                    activeTab === tab?.id 
                    ? 'bg-white border-r-4 border-r-slate-900 text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <Icon name={tab?.icon} size={14} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {activeTab === 'basic' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start space-x-8 pb-10 border-b border-slate-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-none overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-slate-900 p-1">
                        <div className="w-full h-full border border-slate-200 overflow-hidden">
                           <img
                            src={formData?.profileImage || formData?.avatar || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                      </div>
                      {!isReadOnly && (
                         <button 
                          onClick={() => avatarInputRef.current.click()}
                          className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-none hover:bg-slate-800 transition-all border border-white"
                         >
                           <Icon name="Camera" size={14} />
                         </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Identity Configuration</h3>
                      {!isReadOnly && (
                        <div className="space-y-3">
                          <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'profileImage')} />
                          <button
                            onClick={() => avatarInputRef.current.click()}
                            className="px-4 py-2 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                          >
                            Upload New Manifest
                          </button>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Supported formats: RAW, JPG, PNG (Max 2MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">First Name</label>
                      <input 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                        value={formData?.firstName} onChange={(e) => handleInputChange('firstName', e?.target?.value)} disabled={isReadOnly} 
                      />
                      {errors?.firstName && <p className="text-[10px] text-rose-600 font-bold uppercase">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Name</label>
                      <input 
                         className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                         value={formData?.lastName} onChange={(e) => handleInputChange('lastName', e?.target?.value)} disabled={isReadOnly} 
                      />
                      {errors?.lastName && <p className="text-[10px] text-rose-600 font-bold uppercase">{errors.lastName}</p>}
                    </div>
                    <div className="space-y-1.5 overflow-hidden">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</label>
                       <input 
                        type="email"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-mono focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                        value={formData?.email} onChange={(e) => handleInputChange('email', e?.target?.value)} disabled={isReadOnly} 
                      />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Number</label>
                       <input 
                        type="tel"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-mono focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                        value={formData?.phone} onChange={(e) => handleInputChange('phone', e?.target?.value)} disabled={isReadOnly} 
                      />
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Skills & Competencies</label>
                    <textarea
                      placeholder="Enter skills separated by commas..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none rounded-none min-h-[80px] resize-none"
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
                        { label: 'Manager', key: 'manager', options: managerOptions }
                      ].map((f, i) => (
                        <div key={i} className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{f.label}</label>
                           <div className="relative">
                             <select
                               value={formData[f.key]}
                               onChange={(e) => handleInputChange(f.key, e.target.value)}
                               disabled={isReadOnly}
                               className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider focus:ring-1 focus:ring-slate-900 outline-none rounded-none"
                             >
                               <option value="">SELECT {f.label.toUpperCase()}</option>
                               {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>)}
                             </select>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                               <Icon name="ChevronDown" size={14} />
                             </div>
                           </div>
                        </div>
                      ))}
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hire Date</label>
                         <input type="date" value={formData?.hireDate} onChange={(e) => handleInputChange('hireDate', e?.target?.value)} disabled={isReadOnly} className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-mono focus:ring-1 focus:ring-slate-900 outline-none rounded-none" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Salary</label>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">INR</span>
                            <input type="number" value={formData?.salary} onChange={(e) => handleInputChange('salary', e?.target?.value)} disabled={isReadOnly} className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 text-sm font-mono focus:ring-1 focus:ring-slate-900 outline-none rounded-none" />
                         </div>
                      </div>

                      {/* Employee Type & WFH */}
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Employee Type</label>
                         <div className="flex space-x-4 pt-2">
                           {['office', 'field', 'remote'].map((type) => (
                             <label key={type} className="flex items-center space-x-2 cursor-pointer">
                               <input 
                                 type="radio" 
                                 name="employeeType" 
                                 value={type} 
                                 checked={formData.employeeType === type}
                                 onChange={(e) => handleInputChange('employeeType', e.target.value)}
                                 disabled={isReadOnly}
                                 className="rounded-none border-slate-400 text-slate-900 focus:ring-0" 
                               />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{type}</span>
                             </label>
                           ))}
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Work From Home</label>
                         <div className="flex items-center space-x-3 pt-2">
                           <button
                             disabled={isReadOnly}
                             onClick={() => handleInputChange('workFromHome', !formData.workFromHome)}
                             className={`relative inline-flex h-5 w-11 items-center rounded-none transition-all duration-300 border ${formData.workFromHome ? 'bg-slate-900 border-slate-900' : 'bg-slate-100 border-slate-300'}`}
                           >
                              <span className={`inline-block h-3 w-3 transform rounded-none transition-transform duration-300 ${formData.workFromHome ? 'translate-x-6 bg-white' : 'translate-x-1.5 bg-slate-400'}`} />
                           </button>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{formData.workFromHome ? 'Enabled' : 'Disabled'}</span>
                         </div>
                      </div>

                      {formData.checkInTime && (
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Check-in</label>
                           <div className="p-2.5 bg-slate-50 border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                             {new Date(formData.checkInTime).toLocaleString()}
                           </div>
                        </div>
                      )}
                   </div>

                   {/* System Roles - MultiSelect Hardened */}
                   <div className="pt-6 border-t border-slate-100">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 block">System Authorization Roles</label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                         {roles.map(role => {
                           const isSelected = formData.roleIds.includes(role.id);
                           return (
                             <button
                               key={role.id}
                               onClick={() => {
                                 if (isReadOnly) return;
                                 const newRoles = isSelected ? formData.roleIds.filter(id => id !== role.id) : [...formData.roleIds, role.id];
                                 handleInputChange('roleIds', newRoles);
                               }}
                               className={`flex items-center space-x-3 p-3 border transition-all rounded-none text-left ${
                                 isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                               }`}
                             >
                                 <div className={`w-3 h-3 rounded-none border ${isSelected ? 'bg-white border-white' : 'bg-transparent border-slate-300'}`}></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{role.name}</span>
                             </button>
                           );
                         })}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-none mb-6">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em]">Access Privilege Matrix</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Direct system overrides and role-inherited permissions</p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 border border-white/20">
                         <span className="text-xl font-black font-mono tracking-tighter">{formData.permissionIds.length.toString().padStart(2, '0')}</span>
                         <span className="text-[9px] font-black uppercase ml-2 text-slate-400">Manual Overrides</span>
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
                          <div key={idx} className="border border-slate-200 bg-slate-50 overflow-hidden rounded-none shadow-sm hover:shadow-md transition-shadow">
                            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{resource} LAYER</span>
                              <Icon name="Database" size={12} className="text-slate-400" />
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2">
                              {perms.sort((a, b) => a.action.localeCompare(b.action)).map((perm) => {
                                const isInherited = inheritedPermIds.includes(perm.id);
                                const isDirect = formData.permissionIds.includes(perm.id);
                                return (
                                  <button
                                    key={perm.id}
                                    disabled={isInherited || isReadOnly}
                                    onClick={() => {
                                      const newPerms = isDirect ? formData.permissionIds.filter(id => id !== perm.id) : [...formData.permissionIds, perm.id];
                                      handleInputChange('permissionIds', newPerms);
                                    }}
                                    className={`flex items-center space-x-2 px-2 py-1.5 border transition-all text-left ${
                                      isInherited ? 'bg-emerald-50 border-emerald-100 opacity-80' : 
                                      isDirect ? 'bg-slate-900 border-slate-900 text-white' : 
                                      'bg-white border-slate-200 grayscale text-slate-400 hover:grayscale-0 hover:border-slate-400'
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 ${isInherited ? 'bg-emerald-500' : isDirect ? 'bg-white' : 'bg-slate-300'}`}></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">{perm.action}</span>
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
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Address</label>
                      <textarea 
                        className="w-full px-4 py-3 bg-white border border-slate-200 text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none rounded-none min-h-[100px] resize-none"
                        value={formData?.address} onChange={(e) => handleInputChange('address', e?.target?.value)} disabled={isReadOnly} 
                        placeholder="ENTER FULL STREET, CITY, AND ZIP CODE..."
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Emergency Contact</label>
                         <input className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none rounded-none" value={formData?.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)} disabled={isReadOnly} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Emergency Phone</label>
                         <input className="w-full px-4 py-2.5 bg-white border border-slate-200 text-sm font-mono focus:ring-1 focus:ring-slate-900 outline-none rounded-none" value={formData?.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)} disabled={isReadOnly} />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   {!isReadOnly && (
                      <div 
                        onClick={() => docInputRef.current.click()}
                        className="border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center group cursor-pointer hover:bg-slate-100 hover:border-slate-900 transition-all"
                      >
                         <input type="file" multiple hidden ref={docInputRef} onChange={(e) => handleFileChange(e, 'doc')} />
                         <Icon name="UploadCloud" size={48} className="mx-auto mb-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                         <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-900">Upload Documents</span>
                         <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 group-hover:text-slate-500">MAX 10MB PER FILE</p>
                      </div>
                   )}

                   <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">ARCHIVED RECORDINGS ({formData.documents.length})</span>
                        <Icon name="Files" size={14} className="text-slate-900" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {formData.documents.map((doc, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:shadow-lg transition-shadow group">
                              <div className="flex items-center space-x-4 overflow-hidden">
                                 <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                    <Icon name="FileText" size={18} />
                                 </div>
                                 <div className="truncate">
                                    <p className="text-[10px] font-black uppercase text-slate-900 truncate tracking-tight">{doc.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{doc.size} | READY_FOR_SYNC</p>
                                 </div>
                              </div>
                              <div className="flex space-x-1">
                                 <button onClick={() => window.open(doc.url)} className="p-2 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all"><Icon name="Download" size={12} /></button>
                                 {!isReadOnly && <button onClick={() => removeDocument(idx)} className="p-2 border border-slate-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><Icon name="Trash2" size={12} /></button>}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Sharp Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
               <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">SESSION_ACTIVE: SYSTEM_ADMIN_ENCRYPTED</span>
               </div>
               <div className="flex space-x-4">
                  <button 
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:translate-y-0.5"
                  >
                    DISCARD CHANGES
                  </button>
                  {!isReadOnly && (
                    <button 
                      onClick={handleSave}
                      className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-[4px_4px_0px_rgba(15,23,42,0.2)] active:translate-y-0.5 active:shadow-none"
                    >
                      COMMIT TO MANIFEST
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