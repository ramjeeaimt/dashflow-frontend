
import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import {
  MetricsCard,
  AttendanceChart,
  ProductivityChart,
  QuickActionCard,
  FinancialSummaryCard,
  useDashboardStore
} from 'features/dashboard';
import useAuthStore from '../../../store/useAuthStore';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

//  IMPORT EMPLOYEE MODAL & STORE
import { EmployeeModal, useEmployeeStore } from 'features/employee';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  //  MODAL STATE
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const { createEmployee } = useEmployeeStore();

  const { user, can } = useAuthStore();
  const { metrics, charts, feed, financials, loading, fetchDashboardData, refreshDashboard } = useDashboardStore();
  const navigate = useNavigate();

  // Role context flags for UI text/visuals
  const isManagement = can('read', 'employee') || user?.email === 'pritam@difmo.com';
  const isFinance = can('read', 'expense') || user?.email === 'pritam@difmo.com';
  const isTechnical = can('read', 'project') || user?.email === 'pritam@difmo.com';

  useEffect(() => {
    if (user?.company?.id) {
      // If user is Admin/Management, show company-wide metrics by passing null for userId
      const isAdminView = can('manage', 'access-control') || user.roles?.some(r => r.name?.toUpperCase() === 'ADMIN') || user.email === 'admin@difmo.com';
      const fetchUserId = isAdminView ? null : user.id;

      fetchDashboardData(user.company.id, isManagement || isFinance, fetchUserId);
    }
  }, [user, fetchDashboardData, isManagement, isFinance, can]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' }
  ];

  // Management/Admin Metrics
  const adminMetricsData = [
    {
      title: 'TOTAL EMPLOYEE',
      value: (metrics?.totalEmployees ?? 0).toString(),
      description: 'Active Personnel',
      icon: 'Users',
      color: 'primary',
      navigateTo: '/employee-management'
    },
    {
      title: 'PRESENT TODAY',
      value: (metrics?.presentToday ?? 0).toString(),
      description: 'Currently On-Site',
      icon: 'UserCheck',
      color: 'success',
      navigateTo: '/attendance-management'
    },
    {
      title: 'PRODUCTIVITY',
      value: `${metrics?.avgProductivity ?? 0}%`,
      description: 'Target Achievement',
      icon: 'TrendingUp',
      color: 'purple',
      navigateTo: '/time-tracking'
    },
    {
      title: 'ANALYTICS',
      value: (metrics?.activeProjects ?? 0).toString(),
      description: 'System Activity',
      icon: 'Activity',
      color: 'warning',
      navigateTo: '/monitoring-dashboard'
    }
  ];


  const quickActions = [
    {
      title: 'Add New Employee',
      description: 'Register new team member',
      icon: 'UserPlus',
      color: 'primary',
      onClick: () => setIsEmployeeModalOpen(true),
      permission: { action: 'create', resource: 'employee' }
    },
    {
      title: 'Post a Job',
      description: 'Create career opportunities',
      icon: 'Briefcase',
      color: 'success',
      onClick: () => navigate('/difmo-jobs'),
      permission: { action: 'create', resource: 'job' }
    },
    {
      title: 'Review Applications',
      description: 'Check latest candidates',
      icon: 'ClipboardList',
      color: 'warning',
      onClick: () => navigate('/difmo-jobs/'),
      permission: { action: 'read', resource: 'job' }
    },
  ];

  const filteredQuickActions = quickActions.filter(action =>
    !action.permission || can(action.permission.action, action.permission.resource)
  );

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleRefreshData = () => {
    if (user?.company?.id) {
      refreshDashboard(user.company.id, isManagement, user.id);
    }
    setCurrentTime(new Date());
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      const payload = {
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        password: 'welcome123',
        companyId: user?.company?.id || '',
        role: employeeData.roleIds?.[0] || 'Employee',
        roleIds: employeeData.roleIds || [],
        hireDate: employeeData.hireDate || new Date().toISOString(),
        salary: employeeData.salary || '',
        manager: employeeData.manager || '',
        branch: employeeData.branch || '',
        employmentType: employeeData.employmentType || '',
        status: employeeData.status || 'active',
        address: employeeData.address || '',
        emergencyContact: employeeData.emergencyContact || '',
        emergencyPhone: employeeData.emergencyPhone || '',
        skills: employeeData.skills || [],
        permissionIds: employeeData.permissionIds || [],
        avatar: employeeData.avatar || '',
        documents: employeeData.documents || []
      };

      if (employeeData.department) payload.departmentId = employeeData.department;
      if (employeeData.designationId) payload.designationId = employeeData.designationId;

      await createEmployee(payload, user?.company?.id);
      setIsEmployeeModalOpen(false);
      alert('Employee added successfully!');
    } catch (err) {
      alert('Failed to add employee: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    }
  };

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
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">

          {/* Management Metrics Row */}
          {isManagement && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              {adminMetricsData?.map((metric, index) => (
                <MetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  description={metric?.description}
                  icon={metric?.icon}
                  color={metric?.color}
                  onClick={() => metric.navigateTo && navigate(metric.navigateTo)}
                />
              ))}
            </div>
          )}


          {/* Page Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isManagement ? 'Enterprise Hub' : 'My Workspace'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Welcome back, {user?.firstName}. Your unified control center is ready.
              </p>
            </div>
          </div>

          {/* Charts Row - Conditional display for CTO/Management */}
          {(isManagement || isTechnical) && (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3 bg-white p-6 rounded-none border border-slate-100 shadow-sm">
                <AttendanceChart data={charts?.attendance} loading={loading} />
              </div>
              <div className="xl:col-span-2 bg-white p-6 border border-slate-100 shadow-sm">
                <ProductivityChart data={charts?.productivity} loading={loading} />
              </div>
            </div>
          )}

          {/* Finance Section for CFO/CEO */}
          {isFinance && financials && (
            <div className="bg-white border border-slate-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <FinancialSummaryCard data={financials} loading={loading} />
            </div>
          )}

          {/* Quick Actions - Filtered by permission */}
          {filteredQuickActions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600"></div>
                  Command Terminal
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuickActions?.map((action, index) => (
                  <QuickActionCard
                    key={index}
                    title={action?.title}
                    description={action?.description}
                    icon={action?.icon}
                    color={action?.color}
                    badge={action?.badge}
                    onClick={action?.onClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Feed (For Management/Admin) */}
          {isManagement && feed?.recentActivity && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600"></div>
                  Recent Activity Feed
                </h2>
                <span className="text-xs text-slate-500 font-medium">Real-time Updates</span>
              </div>

              <div className="bg-white border border-slate-100 shadow-sm rounded-none p-6">
                <div className="divide-y divide-slate-100">
                  {feed.recentActivity.length > 0 ? (
                    feed.recentActivity.map((log) => {
                      let iconName = 'Info';
                      let iconBg = 'bg-blue-50 text-blue-600';
                      
                      if (log.type === 'task') {
                        iconName = 'CheckSquare';
                        iconBg = 'bg-emerald-50 text-emerald-600';
                      } else if (log.type === 'leave') {
                        iconName = 'Calendar';
                        iconBg = 'bg-amber-50 text-amber-600';
                      }

                      return (
                        <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group hover:bg-slate-50/30 px-2 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                              <Icon name={iconName} size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{log.message}</p>
                              <span className="text-xs text-slate-400 font-medium capitalize mt-0.5 block">{log.type} Activity</span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 font-bold shrink-0">{log.time}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                      <Icon name="Inbox" size={32} className="text-slate-300 animate-pulse" />
                      <p className="font-bold text-xs uppercase tracking-wider">No recent activities found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/*  EMPLOYEE MODAL */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        employee={null}
        mode="add"
        onSave={handleSaveEmployee}
      />

    </div>
  );
};

export default Dashboard;
