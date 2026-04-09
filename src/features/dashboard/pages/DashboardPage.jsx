
import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import {
  MetricsCard,
  AttendanceChart,
  ProductivityChart,
  QuickActionCard,
  RecentActivityFeed,
  PendingApprovals,
  UpcomingEvents,
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
      value: (metrics?.presentToday ?? 0).toString(),
      change: '+5.2%',
      changeType: 'positive',
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8`}>
        <div className="p-6 max-w-[1600px] mx-auto">

          {/* Premium Welcome Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-3xl p-8 mb-10 shadow-xl shadow-blue-500/20 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Icon name="Briefcase" size={16} />
                  <span className="text-sm font-medium tracking-wide uppercase">Admin Overview</span>
                </div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Good Morning, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
                <p className="text-blue-100 text-lg max-w-xl">
                  Ready to manage your team? You have <span className="font-bold text-white underline decoration-white/30">12 pending applications</span> and 3 interviews scheduled for today.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end text-white/90 mr-2">
                  <p className="font-bold text-lg">
                    {currentTime?.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  <p className="text-xs font-medium opacity-70">
                    {currentTime?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={handleRefreshData}
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-95 group"
                  title="Sync Data"
                >
                  <Icon name="RefreshCw" size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
                <button
                  onClick={() => setIsEmployeeModalOpen(true)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Icon name="Plus" size={20} />
                  Hire New Talent
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {metricsData?.map((metric, index) => (
              <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
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

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-10">
            <div className="xl:col-span-3 animate-in fade-in translate-y-4 duration-1000 delay-200 fill-mode-both">
               <AttendanceChart data={charts?.attendance} loading={loading} />
            </div>
            <div className="xl:col-span-2 animate-in fade-in translate-y-4 duration-1000 delay-300 fill-mode-both">
               <ProductivityChart data={charts?.productivity} loading={loading} />
            </div>
          </div>

          {isAdmin && financials && (
            <div className="mb-10 animate-in fade-in translate-y-4 duration-1000 delay-400 fill-mode-both">
              <FinancialSummaryCard data={financials} loading={loading} />
            </div>
          )}

          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                Command Center
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Quick access to essential tools</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions?.map((action, index) => (
                <div key={index} className="animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in translate-y-4 duration-1000 delay-500 fill-mode-both px-1">
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group">
              <RecentActivityFeed activities={feed?.recentActivity} loading={loading} />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group">
              <PendingApprovals approvals={feed?.pendingApprovals} loading={loading} />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group">
              <UpcomingEvents events={feed?.upcomingEvents} loading={loading} />
            </div>
          </div>

        </div>
      </main>

      {/* ✅ EMPLOYEE MODAL */}
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
