import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import api from '../../../utils/api';
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
  const [roles, setRoles] = useState([]); 
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Refs for file uploads
  const avatarInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (employee && mode !== 'add') {
      setFormData({
        firstName: employee?.name?.split(' ')?.[0] || '',
        lastName: employee?.name?.split(' ')?.slice(1)?.join(' ') || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        department: employee?.departmentId || '',
        designationId: employee?.designationId || '',
        roleIds: employee?.roleIds || [],
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
      try {
        const [deptRes, roleRes, designRes] = await Promise.all([
          api.get('/departments'),
          api.get(`/access-control/roles?companyId=${currentUser?.company?.id}`),
          api.get(`/designations?companyId=${currentUser?.company?.id}`) 
        ]);

        const rolesData = roleRes.data?.data || roleRes.data || [];
        setRoles(rolesData.map(r => ({ value: r.id, label: r.name })));

        if (designRes.data) {
          setDesignations(designRes.data.data.map(d => ({ value: d.id, label: d.name })));
        }

        if (deptRes.data) {
          setDepartments(deptRes.data.data.map(d => ({ value: d.id, label: d.name })));
        }
      } catch (error) {
        console.error('Failed to fetch modal data:', error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen, currentUser]);

  //  File Handling Logic
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (type === 'avatar') {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('avatar', reader.result); 
      };
      reader.readAsDataURL(file);
    } else {
      // Append new documents to existing list
      const newDocs = files.map(file => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        file: file 
      }));
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };
  //  End File Handling 

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'User' },
    { id: 'employment', label: 'Roles & Employment', icon: 'Shield' },
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{modalTitle}</h2>
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
                className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab?.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
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
              {/* Avatar Section Updated */}
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
                <Select label="System Role" options={roles} value={formData?.roleIds?.[0]} onChange={(value) => handleInputChange('roleIds', [value])} error={errors?.roleIds} required disabled={isReadOnly} placeholder="Select a role" />
                <Select label="Employment Type" options={employmentTypeOptions} value={formData?.employmentType} onChange={(value) => handleInputChange('employmentType', value)} disabled={isReadOnly} />
                <Select label="Status" options={statusOptions} value={formData?.status} onChange={(value) => handleInputChange('status', value)} disabled={isReadOnly} />
                <Input label="Hire Date" type="date" value={formData?.hireDate} onChange={(e) => handleInputChange('hireDate', e?.target?.value)} error={errors?.hireDate} required disabled={isReadOnly} />
                <Select label="Manager" options={managerOptions} value={formData?.manager} onChange={(value) => handleInputChange('manager', value)} disabled={isReadOnly} />
                <Select label="Branch" options={branchOptions} value={formData?.branch} onChange={(value) => handleInputChange('branch', value)} disabled={isReadOnly} />
                <Input label="Salary" type="number" value={formData?.salary} onChange={(e) => handleInputChange('salary', e?.target?.value)} disabled={isReadOnly} placeholder="Annual salary in USD" />
              </div>
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
                  <h3 className="text-sm font-medium text-foreground">Click to upload documents</h3>
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
  {/* Left Button: Close/Cancel or Previous */}
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

  {/* Right Button: Next or Save/Add */}
  {!isReadOnly && (
    <Button
      variant="default"
      onClick={() => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        const isLastTab = currentIndex === tabs.length - 1;

        if (isLastTab) {
          handleSave(); // Final step: Save data
        } else {
          setActiveTab(tabs[currentIndex + 1].id); // Move to next tab
        }
      }}
      loading={isLoading}
      // Dynamic Icon based on step
      iconName={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? "Save" : "ArrowRight"}
      iconPosition={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? "left" : "right"}
    >
      {/* Dynamic Text: Show "Next" for first 3 tabs, then actual action on 4th */}
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