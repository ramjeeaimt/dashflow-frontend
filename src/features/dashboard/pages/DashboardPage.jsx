
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
      title: 'Total Employees',
      value: (metrics?.totalEmployees ?? 0).toString(),
      change: '+12',
      changeType: 'positive',
      icon: 'Users',
      color: 'primary'
    },
    {
      title: 'Present Today',
      value: `${metrics?.presentToday ?? 0} / ${metrics?.totalEmployees ?? 0}`,
      change: metrics?.attendanceBreakdown 
        ? (metrics.attendanceBreakdown.early > 0 || metrics.attendanceBreakdown.late > 0)
          ? `${metrics.attendanceBreakdown.early > 0 ? `${metrics.attendanceBreakdown.early} Early` : ''}${metrics.attendanceBreakdown.early > 0 && metrics.attendanceBreakdown.late > 0 ? ', ' : ''}${metrics.attendanceBreakdown.late > 0 ? `${metrics.attendanceBreakdown.late} Late` : ''}`
          : 'All on time'
        : 'Calculating...',
      changeType: metrics?.attendanceBreakdown?.late > 0 ? 'negative' : 'positive',
      icon: 'UserCheck',
      color: 'success'
    },
    {
      title: 'Tasks Completed',
      value: (metrics?.tasksCompleted ?? 0).toString(),
      change: '+18%',
      changeType: 'positive',
      icon: 'CheckSquare',
      color: 'primary'
    },
    {
      title: 'Avg Productivity',
      value: `${metrics?.avgProductivity ?? 0}%`,
      change: '+3.1%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'success'
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
      onClick: () => navigate('/jobs')
    },
    {
      title: 'Review Applications',
      description: 'Check latest candidate applications and status',
      icon: 'ClipboardList',
      color: 'warning',
      onClick: () => navigate('/jobs/applications')
    },
    {
      title: 'Check Messages',
      description: 'View and respond to recruitment inquiries',
      icon: 'MessageSquare',
      color: 'primary',
      badge: 'New',
      onClick: () => navigate('/messages')
    }
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
    <div className="min-h-screen bg-white">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8`}>
        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
          
          {/* Industrial Header Block */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8 bg-blue-800 text-white border-b-4 border-slate-700 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                <span className="w-8 h-px bg-slate-700"></span>
                <Icon name="Briefcase" size={14} />
                <span>COMMAND_MODULE_ACTIVE</span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                HELLO, {user?.name?.split(' ')[0] || 'ADMIN'} <span className="text-slate-500 font-normal">/</span> DASHBOARD
              </h1>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">
                  <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                  <span>System Synced</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">ADMIN_ACCESS: GRANTED_SECURE_TOKEN</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
               <div className="text-right pr-6 border-r border-white/10 hidden sm:block">
                  <p className="text-xl font-black font-mono tracking-tighter uppercase whitespace-nowrap">
                    {currentTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {currentTime?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
               </div>
               <button
                  onClick={handleRefreshData}
                  className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:translate-y-0.5 group"
                >
                  <Icon name="RefreshCw" size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)]">
            {metricsData?.map((metric, index) => (
              <div key={index} className={`border-slate-900  ${index < metricsData.length - 1 ? 'lg:border-r' : ''} ${index % 2 === 0 && index < metricsData.length - 2 ? 'sm:border-r lg:border-r' : ''} ${index < 2 ? 'sm:border-b lg:border-b-0' : ''} ${index >= 2 ? 'border-t lg:border-t-0' : ''}`}>
                <MetricsCard
                  title={metric?.title}
                  value={metric?.value}
                  change={metric?.change}
                  changeType={metric?.changeType}
                  icon={metric?.icon}
                  color={metric?.color}
                />
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-0 border border-slate-200">
            <div className="xl:col-span-3 border-b xl:border-b-0 xl:border-r border-slate-200">
              <AttendanceChart data={charts?.attendance} loading={loading} />
            </div>
            <div className="xl:col-span-2">
              <ProductivityChart data={charts?.productivity} loading={loading} />
            </div>
          </div>

          {isAdmin && financials && (
            <div className="border border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)]">
              <FinancialSummaryCard data={financials} loading={loading} />
            </div>
          )}

          {/* Quick Actions / Command Center */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 flex items-center gap-4">
                <span className="w-12 h-1 bg-slate-900"></span>
                Action Terminal
              </h2>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Operational Hotlinking v2.4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions?.map((action, index) => (
                <div key={index}>
                  <QuickActionCard
                    title={action?.title}
                    description={action?.description}
                    icon={action?.icon}
                    color={action?.color}
                    badge={action?.badge}
                    onClick={action?.onClick}
                  />
                </div>
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
