import React, { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "api/client";
import { API_ENDPOINTS } from "api/endpoints";
import Header from "components/ui/Header";
import Sidebar from "components/ui/Sidebar";
import ImageUpload from "components/ui/ImageUpload";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16 pb-8`}>
        <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mt-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ImageUpload
                initialImage={user?.avatar}
                initials={initials}
                size="w-20 h-20"
                onUploadSuccess={(url) => {
                  setFormData((prev) => ({ ...prev, avatar: url }));
                  // Optional: auto-save or just wait for user to click "Save User"
                }}
              />
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p>{formData.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isEditingUser ? (
                <button
                  onClick={() => setIsEditingUser(true)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold"
                >
                  Edit User
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingUser(false);
                      setFormData(user);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateUser}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Save User
                  </button>
                </>
              )}

              {!isEditingCompany ? (
                <button
                  onClick={() => setIsEditingCompany(true)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold"
                >
                  Edit Company
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingCompany(false);
                      setFormData(user);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateCompany}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save Company
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">User Info</h3>

              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                disabled={!isEditingUser}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                disabled={!isEditingUser}
              />
              <Input
                label="Email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                disabled={!isEditingUser}
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                disabled={!isEditingUser}
              />
            </div>

            {/* Company Info */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-lg">Company Info</h3>

              <Input
                label="Company Name"
                name="company.name"
                value={company.name || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Website"
                type="url"
                name="company.website"
                value={company.website || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Industry"
                name="company.industry"
                value={company.industry || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Size"
                type="number"
                name="company.size"
                value={company.size || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Email"
                type="email"
                name="company.email"
                value={company.email || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Phone"
                type="tel"
                name="company.phone"
                value={company.phone || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Address"
                name="company.address"
                value={company.address || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="City"
                name="company.city"
                value={company.city || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Postal Code"
                name="company.postalCode"
                value={company.postalCode || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
              <Input
                label="Country"
                name="company.country"
                value={company.country || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />

              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  name="company.timezone"
                  value={company.timezone || ""}
                  onChange={handleChange}
                  disabled={!isEditingCompany}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timezone</option>
                  <option value="Asia/Kolkata">(UTC+05:30) Asia/Kolkata</option>
                  <option value="UTC">(UTC+00:00) UTC</option>
                  <option value="America/New_York">(UTC-05:00) America/New_York</option>
                  <option value="Europe/London">(UTC+00:00) Europe/London</option>
                </select>
              </div>

              <Input
                label="Currency"
                name="company.currency"
                value={company.currency || ""}
                onChange={handleChange}
                disabled={!isEditingCompany}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      {...props}
      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default Profile;
