
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

  const { user } = useAuthStore();
  const { metrics, charts, feed, financials, loading, fetchDashboardData, refreshDashboard } = useDashboardStore();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.some(role =>
    ['admin', 'owner', 'super-admin', 'manager'].includes(role.name.toLowerCase())
  );

  useEffect(() => {
    if (user?.company?.id) {
      fetchDashboardData(user.company.id, isAdmin, user.id);
    }
  }, [user, fetchDashboardData, isAdmin]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' }
  ];

  const metricsData = [
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

  const quickActions = [
    {
      title: 'Add New Employee',
      description: 'Register new team member with complete profile',
      icon: 'UserPlus',
      color: 'primary',
      onClick: () => setIsEmployeeModalOpen(true)
    },
    {
      title: 'Post a Job',
      description: 'Create and manage new career opportunities',
      icon: 'Briefcase',
      color: 'success',
      onClick: () => navigate('/difmo-jobs')
    },
    {
      title: 'Review Applications',
      description: 'Check latest candidate applications and status',
      icon: 'ClipboardList',
      color: 'warning',
      onClick: () => navigate('/difmo-jobs/')
    },
    // {
    //   title: 'Check Messages',
    //   description: 'View and respond to recruitment inquiries',
    //   icon: 'MessageSquare',
    //   color: 'primary',
    //   badge: 'New',
    //   onClick: () => navigate('/messages')
    // }
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleRefreshData = () => {
    if (user?.company?.id) {
      refreshDashboard(user.company.id, isAdmin, user.id);
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
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsData?.map((metric, index) => (
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

          {/* Page Header Section - Matching Screenshot */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">CRM Dashboard</h2>
              <p className="text-slate-500 text-sm mt-1">Manage and track all your clients, projects, and business relationships in one place</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search clients, projects, emails..." 
                  className="pl-11 pr-4 py-2.5 w-64 lg:w-80 bg-white border border-slate-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <button
              
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-none text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Icon name="Download" size={18} strokeWidth={3} />
               Export
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3 bg-white p-6 rounded-none border border-slate-100 shadow-sm">
              <AttendanceChart data={charts?.attendance} loading={loading} />
            </div>
            <div className="xl:col-span-2 bg-white p-6 border border-slate-100 shadow-sm">
              <ProductivityChart data={charts?.productivity} loading={loading} />
            </div>
          </div>

          {isAdmin && financials && (
            <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
              <FinancialSummaryCard data={financials} loading={loading} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600"></div>
                Action Terminal
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions?.map((action, index) => (
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
