import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import useAuthStore from '../../../store/useAuthStore';

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
        avatar: employee?.avatar || '',
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
        setRoles(rolesData); // Keep the whole object for permission lookup

        const designsData = designRes.data?.data || designRes.data || [];
        setDesignations(designsData.map(d => ({ value: d.id, label: d.name })));

        const deptsData = deptRes.data?.data || deptRes.data || [];
        setDepartments(deptsData.map(d => ({ value: d.id, label: d.name })));

        const permsData = permissionRes.data?.data || permissionRes.data || [];
        setAvailablePermissions(permsData);
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

  setIsLoading(true); // Show a loader while uploading

  try {
    if (type === "avatar") {
      const file = files[0];
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      
      // Use your existing apiClient instead of raw axios
      const res = await apiClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formDataUpload);
      
      // Use the URL from your backend response
      const imageUrl = res.data.url || res.data.secure_url;
      handleInputChange("avatar", imageUrl);
      
    } else {
      // Logic for multiple documents
      const uploadPromises = files.map(async (file) => {
        const docData = new FormData();
        docData.append("file", file);
        
        const res = await apiClient.post(API_ENDPOINTS.UPLOAD.DOCUMENT, docData);
        
        return {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.type,
          url: res.data.url, // The URL returned from your server
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs],
      }));
    }
  } catch (error) {
    console.error(`${type} upload failed:`, error);
    // You should add a toast notification here
  } finally {
    setIsLoading(false);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{modalTitle}</h2>
              {employee && <p className="text-sm text-muted-foreground">ID: {employee?.id}</p>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors ${activeTab === tab?.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
                  <Image
                    src={formData?.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {!isReadOnly && (
                  <div>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Upload"
                      onClick={() => avatarInputRef.current.click()}
                    >
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" value={formData?.firstName} onChange={(e) => handleInputChange('firstName', e?.target?.value)} error={errors?.firstName} required disabled={isReadOnly} />
                <Input label="Last Name" value={formData?.lastName} onChange={(e) => handleInputChange('lastName', e?.target?.value)} error={errors?.lastName} required disabled={isReadOnly} />
                <Input label="Email Address" type="email" value={formData?.email} onChange={(e) => handleInputChange('email', e?.target?.value)} error={errors?.email} required disabled={isReadOnly} />
                <Input label="Phone Number" type="tel" value={formData?.phone} onChange={(e) => handleInputChange('phone', e?.target?.value)} disabled={isReadOnly} />
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Department" options={departments} value={formData?.department} onChange={(value) => handleInputChange('department', value)} error={errors?.department} required disabled={isReadOnly} />
                <Select label="Designation" options={designations} value={formData?.designationId} onChange={(value) => handleInputChange('designationId', value)} error={errors?.designationId} required disabled={isReadOnly} placeholder="Select a designation" />
                <Select
                  label="System Roles"
                  options={roles.map(r => ({ value: r.id, label: r.name }))}
                  value={formData?.roleIds}
                  onChange={(value) => handleInputChange('roleIds', value)}
                  error={errors?.roleIds}
                  required
                  disabled={isReadOnly}
                  placeholder="Select roles"
                  multiple={true}
                />
                <Select label="Employment Type" options={employmentTypeOptions} value={formData?.employmentType} onChange={(value) => handleInputChange('employmentType', value)} disabled={isReadOnly} />
                <Select label="Status" options={statusOptions} value={formData?.status} onChange={(value) => handleInputChange('status', value)} disabled={isReadOnly} />
                <Input label="Hire Date" type="date" value={formData?.hireDate} onChange={(e) => handleInputChange('hireDate', e?.target?.value)} error={errors?.hireDate} required disabled={isReadOnly} />
                <Select label="Manager" options={managerOptions} value={formData?.manager} onChange={(value) => handleInputChange('manager', value)} disabled={isReadOnly} />
                <Select label="Branch" options={branchOptions} value={formData?.branch} onChange={(value) => handleInputChange('branch', value)} disabled={isReadOnly} />
                <Input label="Salary" type="number" value={formData?.salary} onChange={(e) => handleInputChange('salary', e?.target?.value)} disabled={isReadOnly} placeholder="Annual salary" />
              </div>

              {/* Permissions Preview */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Shield" size={16} className="text-primary" />
                  Granted Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.roleIds.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No roles selected. No permissions granted.</p>
                  ) : (
                    // Extract unique permissions from selected roles
                    Array.from(new Set(
                      roles
                        .filter(r => formData.roleIds.includes(r.id))
                        .flatMap(r => r.permissions || [])
                        .map(p => `${p.action}:${p.resource}`)
                    )).map((permStr, idx) => {
                      const [action, resource] = permStr.split(':');
                      return (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight">
                          {action} {resource}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Custom Access Rights</h3>
                  <p className="text-sm text-muted-foreground">Assign specific permissions directly to this employee, in addition to their roles.</p>
                </div>
                <div className="flex gap-2">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {formData.permissionIds.length} Direct
                  </div>
                  <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {Array.from(new Set(
                      roles
                        .filter(r => formData.roleIds.includes(r.id))
                        .flatMap(r => r.permissions || [])
                        .map(p => p.id)
                    )).length} From Roles
                  </div>
                </div>
              </div>

              {/* Group permissions by resource */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(
                  availablePermissions.reduce((acc, perm) => {
                    if (!acc[perm.resource]) acc[perm.resource] = [];
                    acc[perm.resource].push(perm);
                    return acc;
                  }, {})
                ).map(([resource, perms], idx) => {
                  // Get permissions inherited from roles for this resource
                  const inheritedPermIds = roles
                    .filter(r => formData.roleIds.includes(r.id))
                    .flatMap(r => r.permissions || [])
                    .filter(p => p.resource === resource)
                    .map(p => p.id);

                  return (
                    <div key={idx} className="p-5 border border-border rounded-xl bg-card shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                          <Icon name="Database" size={16} />
                        </div>
                        <h4 className="font-bold text-sm capitalize">{resource} Management</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {perms.sort((a, b) => a.action.localeCompare(b.action)).map((perm) => {
                          const isInherited = inheritedPermIds.includes(perm.id);
                          const isDirect = formData.permissionIds.includes(perm.id);
                          const isActive = isInherited || isDirect;

                          return (
                            <label
                              key={perm.id}
                              className={`flex items-center p-2 rounded-lg border transition-all cursor-pointer ${isInherited
                                  ? 'bg-primary/5 border-primary/20 cursor-not-allowed opacity-80'
                                  : isDirect
                                    ? 'bg-primary/10 border-primary/40'
                                    : 'hover:bg-muted/50 border-transparent'
                                }`}
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={isActive}
                                  disabled={isInherited || isReadOnly}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    handleInputChange('permissionIds', (prevIds = []) => {
                                      if (isChecked) {
                                        return [...new Set([...prevIds, perm.id])];
                                      } else {
                                        return prevIds.filter(id => id !== perm.id);
                                      }
                                    });
                                  }}
                                />
                              </div>
                              <div className="ml-3">
                                <span className={`text-xs font-medium capitalize ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {perm.action}
                                </span>
                                {isInherited && (
                                  <p className="text-[9px] text-primary/70 leading-none mt-0.5">Via Role</p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {permissionsLoading && availablePermissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                  <Icon name="Loader" size={32} className="text-muted-foreground animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">Loading Permissions...</h3>
                </div>
              )}

              {!permissionsLoading && availablePermissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                  <Icon name="AlertCircle" size={48} className="text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No Permissions Found</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto mt-2 mb-6">
                    The system's permission table is currently empty. Please seed the permissions or contact your system administrator.
                  </p>
                  <Button
                    variant="outline"
                    iconName="Database"
                    onClick={async () => {
                      try {
                        await apiClient.post(API_ENDPOINTS.ACCESS_CONTROL.BASE + '/seed');
                        // Refresh data
                        const res = await apiClient.get(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS);
                        setAvailablePermissions(res.data?.data || res.data || []);
                        toast.success("Permissions seeded successfully!");
                      } catch (err) {
                        console.error('Seed failed:', err);
                      }
                    }}
                  >
                    Seed Default Permissions
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Input label="Address" value={formData?.address} onChange={(e) => handleInputChange('address', e?.target?.value)} disabled={isReadOnly} placeholder="Full address" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Emergency Contact Name" value={formData?.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)} disabled={isReadOnly} />
                  <Input label="Emergency Contact Phone" type="tel" value={formData?.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)} disabled={isReadOnly} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {!isReadOnly && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => docInputRef.current.click()}
                >
                  <input
                    type="file"
                    multiple
                    hidden
                    ref={docInputRef}
                    onChange={(e) => handleFileChange(e, 'doc')}
                  />
                  <Icon name="UploadCloud" className="mx-auto mb-2 text-muted-foreground" size={32} />
                  <h3 className="text-sm font-medium">Click to upload documents</h3>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or Images up to 10MB</p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Icon name="Files" size={16} />
                  Attached Documents ({formData.documents.length})
                </h4>

                {formData.documents.length === 0 && (
                  <div className="text-center py-6 bg-muted/20 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground italic">No documents uploaded yet.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {formData.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-md bg-card hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 rounded">
                          <Icon name="FileText" size={18} className="text-primary" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => window.open(doc.url || '#')}>
                          <Icon name="Download" size={16} />
                        </Button>
                        {!isReadOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeDocument(idx)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          {isReadOnly && (
            <div className="flex-1 text-sm text-amber-600 font-medium flex items-center gap-2">
              <Icon name="Lock" size={14} />
              Read-Only Mode
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = tabs.findIndex(t => t.id === activeTab);
              if (currentIndex > 0 && !isReadOnly) {
                setActiveTab(tabs[currentIndex - 1].id);
              } else {
                onClose();
              }
            }}
          >
            {isReadOnly ? 'Close' : (tabs.findIndex(t => t.id === activeTab) > 0 ? 'Back' : 'Cancel')}
          </Button>

          {!isReadOnly && (
            <Button
              variant="default"
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                const isLastTab = currentIndex === tabs.length - 1;
                if (isLastTab) {
                  handleSave();
                } else {
                  setActiveTab(tabs[currentIndex + 1].id);
                }
              }}
              loading={isLoading}
              iconName={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? "Save" : "ArrowRight"}
              iconPosition={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? "left" : "right"}
            >
              {tabs.findIndex(t => t.id === activeTab) < tabs.length - 1
                ? 'Next'
                : (mode === 'add' ? 'Add Employee' : 'Save Changes')
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;