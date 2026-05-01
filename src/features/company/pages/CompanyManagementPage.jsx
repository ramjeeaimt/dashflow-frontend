import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Ban,
  CheckCircle,
  Trash2,
  Activity,
  Search,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import apiClient from '../../../api/client';
import useAuthStore from '../../../store/useAuthStore';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';

const CompanyManagementPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { impersonate } = useAuthStore();

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const handleToggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/system-company');
      setCompanies(response.data?.data || response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies. Please ensure you have super admin access.');
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm('Are you sure you want to block this company? All users will lose access.')) return;
    try {
      await apiClient.patch(`/system-company/${id}/block`);
      fetchCompanies();
    } catch (err) {
      alert('Failed to block company');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await apiClient.patch(`/system-company/${id}/unblock`);
      fetchCompanies();
    } catch (err) {
      alert('Failed to unblock company');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company? This is a temporary deletion (soft delete).')) return;
    try {
      await apiClient.delete(`/system-company/${id}`);
      fetchCompanies();
    } catch (err) {
      alert('Failed to delete company');
    }
  };

  const handleLoginAsAdmin = async (company) => {
    // Find the primary admin of the company
    const adminUser = company.users?.find(u =>
      u.roles?.some(r => r.name === 'Admin' || r.name === 'Super Admin') ||
      u.email === company.email
    );

    if (!adminUser) {
      alert('No admin user found for this company.');
      return;
    }

    if (window.confirm(`Login as ${adminUser.email} (${company.name})?`)) {
      try {
        await impersonate(adminUser.id);
      } catch (err) {
        alert('Impersonation failed');
      }
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } pt-16 pb-8`}>
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Company Management</h1>
              <p className="text-slate-500">Manage all registered companies and their access.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div key={company.id} className={`group relative rounded-xl border bg-white p-5 transition-all hover:shadow-md ${company.isDeleted ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-full w-full rounded-lg object-contain" />
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {company.status}
                </span>
                {company.isDeleted && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    Deleted
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{company.name}</h3>
              <p className="text-sm text-slate-500">{company.email}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4 text-[12px] text-slate-500">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{company.users?.length || 0} Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity size={14} />
                <span>{company.industry || 'General'}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => handleLoginAsAdmin(company)}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                title="Login as Company Admin"
              >
                <ExternalLink size={14} />
                Impersonate
              </button>

              <div className="flex items-center gap-1">
                {company.status === 'active' ? (
                  <button
                    onClick={() => handleBlock(company.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Block Company"
                  >
                    <Ban size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnblock(company.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all"
                    title="Unblock Company"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}

                {!company.isDeleted && (
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Delete Company"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-20 text-center">
          <Building2 size={48} className="mb-4 text-slate-200" />
          <h3 className="text-lg font-semibold text-slate-900">No companies found</h3>
          <p className="text-slate-500">Try adjusting your search term.</p>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default CompanyManagementPage;
