import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import apiClient from '../../../api/client';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';

const GlobalUsersPage = () => {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        setLoading(true);
        // Clean call to get all founders globally
        const response = await apiClient.get('/employees', { 
          params: { roleName: 'Admin' } 
        });
        const data = response.data?.data || response.data;
        setFounders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch founders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFounders();
  }, []);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'System Admin', path: '#' },
    { label: 'Global Users', path: '/global-users' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8 bg-muted/60 min-h-screen`}>
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto">
          <div className="mb-8">
            <BreadcrumbNavigation items={breadcrumbItems} />
            <h1 className="text-3xl font-bold text-foreground mt-4">Global Founder Directory</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              List of all company owners and administrators across the platform.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/60 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Founder Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground/70">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-2 text-sm">Loading founders...</p>
                      </td>
                    </tr>
                  ) : founders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground/70">
                        <p className="text-lg font-medium">No founders found</p>
                        <p className="text-sm">Try checking the database roles again.</p>
                      </td>
                    </tr>
                  ) : (
                    founders.map((founder) => (
                      <tr key={founder.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {founder.user?.firstName?.[0] || 'U'}
                            </div>
                            <span className="font-semibold text-foreground">
                              {founder.user?.firstName} {founder.user?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{founder.user?.email}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{founder.company?.name || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase border border-border">
                            {founder.user?.roles?.[0]?.name || 'Admin'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
 founder.status === 'active' 
 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
 : 'bg-amber-50 text-amber-600 border-amber-100'
 }`}>
                            {founder.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GlobalUsersPage;
