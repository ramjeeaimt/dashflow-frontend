
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

//  IMPORT EMPLOYEE MODAL
import { EmployeeModal } from 'features/employee';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  //  MODAL STATE
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const { user, can } = useAuthStore();
  const { metrics, charts, feed, financials, loading, fetchDashboardData, refreshDashboard } = useDashboardStore();
  const navigate = useNavigate();

  // Role context flags for UI text/visuals
  const isManagement = can('read', 'employee');
  const isFinance = can('read', 'expense');
  const isTechnical = can('read', 'project');

  useEffect(() => {
    if (user?.company?.id) {
      fetchDashboardData(user.company.id, isManagement, user.id);
    }
  }, [user, fetchDashboardData, isManagement]);

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
      color: 'primary'
    },
    {
      title: 'PRESENT TODAY',
      value: (metrics?.presentToday ?? 0).toString(),
      description: 'Currently On-Site',
      icon: 'UserCheck',
      color: 'success'
    },
    {
      title: 'PRODUCTIVITY',
      value: `${metrics?.avgProductivity ?? 0}%`,
      description: 'Target Achievement',
      icon: 'TrendingUp',
      color: 'purple'
    },
    {
      title: 'ANALYTICS',
      value: (metrics?.activeProjects ?? 0).toString(),
      description: 'System Activity',
      icon: 'Activity',
      color: 'warning'
    }
  ];

  // Personal/Employee Metrics (Placeholder values until store supports personal metrics)
  const personalMetricsData = [
    {
      title: 'MY ATTENDANCE',
      value: 'Checked In',
      description: 'Today at 09:30 AM',
      icon: 'Clock',
      color: 'primary'
    },
    {
      title: 'PENDING TASKS',
      value: '4',
      description: 'Assigned to me',
      icon: 'CheckCircle',
      color: 'warning'
    },
    {
      title: 'LEAVE STATUS',
      value: 'Available',
      description: '12 Days remaining',
      icon: 'Calendar',
      color: 'success'
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
    setIsEmployeeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8`}>
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          
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
                />
              ))}
            </div>
          )}

          {/* Personal Activity Row */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Icon name="Activity" size={18} className="text-blue-500" />
              My Current Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {personalMetricsData?.map((metric, index) => (
                <MetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  description={metric?.description}
                  icon={metric?.icon}
                  color={metric?.color}
                />
              ))}
            </div>
          </div>

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
