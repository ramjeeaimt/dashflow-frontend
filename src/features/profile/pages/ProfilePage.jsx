import React, { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "api/client";
import { API_ENDPOINTS } from "api/endpoints";
import Header from "components/ui/Header";
import Sidebar from "components/ui/Sidebar";
import ImageUpload from "components/ui/ImageUpload";
import Icon from "components/AppIcon";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);

        setUser(res.data.data);
        setFormData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    // console.log("hfghjk",formData);
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("company.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        company: {
          ...prev.company,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update user info
  const updateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await apiClient.patch(
        API_ENDPOINTS.AUTH.PROFILE,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
        }
      );

      setUser((prev) => ({ ...prev, ...formData }));
      setIsEditingUser(false);
      alert("User info updated successfully!");
    } catch (err) {
      console.error(err);
      alert("User info update failed");
    }
  };

  // Update company info
  const updateCompany = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!formData.company?.id) return;

      await apiClient.patch(
        `/company/${formData.company.id}`,
        formData.company
      );

      setUser((prev) => ({ ...prev, company: { ...formData.company } }));
      setIsEditingCompany(false);
      alert("Company info updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Company info update failed");
    }
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!user) return <div className="p-10">Loading profile...</div>;

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`;
  const company = formData.company || {};

  const sections = [
    { id: 'profile', label: 'Public Profile', icon: 'User', description: 'Manage your personal information' },
    { id: 'account', label: 'Account Settings', icon: 'Settings', description: 'Email and security preferences' },
    { id: 'organization', label: 'Organization Info', icon: 'Building', description: 'Details about your workplace' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16 pb-8`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">User Settings</h1>
            <p className="text-slate-500 mt-1">Manage your identity and workplace configuration.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Page Internal Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeSection === section.id
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <Icon name={section.icon} size={18} className={activeSection === section.id ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {sections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                {activeSection === 'profile' && !isEditingUser && (
                  <button onClick={() => setIsEditingUser(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Edit Profile
                  </button>
                )}
                {activeSection === 'organization' && !isEditingCompany && user?.roles?.some(r => ['Admin', 'ADMIN', 'Super Admin'].includes(r.name)) && (
                  <button onClick={() => setIsEditingCompany(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Edit Company
                  </button>
                )}
              </div>

              <div className="p-8">
                {activeSection === 'profile' && (
                  <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                      <ImageUpload
                        initialImage={user?.avatar}
                        initials={initials}
                        size="w-24 h-24 shadow-md ring-4 ring-white"
                        onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{formData.firstName} {formData.lastName}</h3>
                        <p className="text-slate-500">{formData.email}</p>
                        <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user?.roles?.some(r => ['Admin', 'ADMIN', 'Super Admin'].includes(r.name))
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {user?.roles?.find(r => ['Admin', 'ADMIN', 'Super Admin'].includes(r.name)) ? 'Company Administrator' : 'Employee'}
                        </div>
                      </div>
                    </div>

                    {isEditingUser ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
                        <Input label="First Name" name="firstName" value={formData.firstName || ""} onChange={handleChange} />
                        <Input label="Last Name" name="lastName" value={formData.lastName || ""} onChange={handleChange} />
                        <Input label="Email Address" name="email" value={formData.email || ""} onChange={handleChange} />
                        <Input label="Phone Number" name="phone" value={formData.phone || ""} onChange={handleChange} />
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                          <button onClick={() => setIsEditingUser(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                          <button onClick={updateUser} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700">Save Profile</button>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        <DetailRow label="Full Name" value={`${formData.firstName} ${formData.lastName}`} icon="User" />
                        <DetailRow label="Email Address" value={formData.email} icon="Mail" />
                        <DetailRow label="Mobile Phone" value={formData.phone || 'Not linked'} icon="Phone" />
                        <DetailRow label="Account Security" value="Two-factor authentication enabled" icon="ShieldCheck" />
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'organization' && (
                  <div className="space-y-6">
                    {isEditingCompany ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
                        <Input label="Company Name" name="company.name" value={company.name || ""} onChange={handleChange} />
                        <Input label="Website" name="company.website" value={company.website || ""} onChange={handleChange} />
                        <Input label="Industry" name="company.industry" value={company.industry || ""} onChange={handleChange} />
                        <Input label="Team Size" name="company.size" value={company.size || ""} onChange={handleChange} />
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                          <button onClick={() => setIsEditingCompany(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                          <button onClick={updateCompany} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700">Update Organization</button>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        <DetailRow label="Organization Name" value={company.name} icon="Building" />
                        <DetailRow label="Primary Website" value={company.website} icon="Globe" />
                        <DetailRow label="Industry Domain" value={company.industry} icon="Briefcase" />
                        <DetailRow label="Headquarters" value={company.address || 'Global HQ'} icon="MapPin" />
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'account' && (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Shield" size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Security & Credentials</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">Security settings and password management are coming soon. Contact system admin for immediate changes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const DetailRow = ({ label, value, icon }) => (
  <div className="py-4 flex flex-col sm:flex-row sm:items-center">
    <div className="w-full sm:w-1/3 flex items-center gap-3 mb-1 sm:mb-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon name={icon} size={16} />
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
    <div className="w-full sm:w-2/3 pl-11 sm:pl-0">
      <p className="text-sm font-semibold text-slate-900">{value || 'Not set'}</p>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
    />
  </div>
);

export default Profile;
