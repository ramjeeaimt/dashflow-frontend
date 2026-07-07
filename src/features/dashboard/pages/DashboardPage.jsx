
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { isAdminUser, isSystemAdmin } from '../../../config/roles';

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
  const isManagement = can('read', 'employee') || isSystemAdmin(user);
  const isFinance = can('read', 'expense') || isSystemAdmin(user);
  const isTechnical = can('read', 'project') || isSystemAdmin(user);

  useEffect(() => {
    if (user?.company?.id) {
      // If user is Admin/Management, show company-wide metrics by passing null for userId
      const isAdminView = can('manage', 'access-control') || isAdminUser(user);
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
      title: 'Total employees',
      value: (metrics?.totalEmployees ?? 0).toString(),
      description: 'Active headcount',
      icon: 'Users',
      color: 'primary',
      navigateTo: '/employee-management'
    },
    {
      title: 'Present today',
      value: (metrics?.presentToday ?? 0).toString(),
      description: 'Checked in',
      icon: 'UserCheck',
      color: 'success',
      navigateTo: '/attendance-management'
    },
    {
      title: 'Productivity',
      value: `${metrics?.avgProductivity ?? 0}%`,
      description: 'Task completion rate',
      icon: 'TrendingUp',
      color: 'purple',
      navigateTo: '/time-tracking'
    },
    {
      title: 'Active projects',
      value: (metrics?.activeProjects ?? 0).toString(),
      description: 'In delivery',
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
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
 } pt-16 pb-12`}>
        <motion.div
          className="px-4 sm:px-8 py-8 max-w-[1440px] mx-auto space-y-10"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
        >

          {/* ── Greeting hero ─────────────────────────────────────────── */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                {user?.firstName ? `, ${user.firstName}` : ''}
              </h1>
            </div>
            {can('create', 'employee') && (
              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors self-start sm:self-auto"
              >
                <Icon name="UserPlus" size={15} />
                Add employee
              </button>
            )}
          </motion.div>

          {/* ── Stat row ──────────────────────────────────────────────── */}
          {isManagement && (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
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
            </motion.div>
          )}

          {/* ── Bento: main chart + quick-actions rail ────────────────── */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {(isManagement || isTechnical) && (
              <div className="lg:col-span-2 bg-card p-6 rounded-lg border border-border card-shadow">
                <AttendanceChart data={charts?.attendance} loading={loading} />
              </div>
            )}

            {filteredQuickActions.length > 0 && (
              <div className={(isManagement || isTechnical) ? '' : 'lg:col-span-3'}>
                <div className="bg-card rounded-lg border border-border card-shadow p-5 h-full">
                  <h2 className="font-display text-sm font-semibold tracking-tight text-foreground mb-4">
                    Quick actions
                  </h2>
                  <div className={`grid gap-2 ${(isManagement || isTechnical) ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {filteredQuickActions?.map((action, index) => (
                      <button
                        key={index}
                        onClick={action?.onClick}
                        className="w-full flex items-center gap-3 p-3 rounded-md border border-transparent hover:border-border hover:bg-muted/60 text-left transition-colors group"
                      >
                        <span className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                          <Icon name={action?.icon} size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground truncate">{action?.title}</span>
                          <span className="block text-xs text-muted-foreground truncate">{action?.description}</span>
                        </span>
                        <Icon
                          name="ArrowRight"
                          size={14}
                          className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Productivity + Finance row ────────────────────────────── */}
          {((isManagement || isTechnical) || (isFinance && financials)) && (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              {(isManagement || isTechnical) && (
                <div className="bg-card p-6 rounded-lg border border-border card-shadow">
                  <ProductivityChart data={charts?.productivity} loading={loading} />
                </div>
              )}
              {isFinance && financials && (
                <div className={`bg-card rounded-lg border border-border card-shadow overflow-hidden ${(isManagement || isTechnical) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <FinancialSummaryCard data={financials} loading={loading} />
                </div>
              )}
            </motion.div>
          )}

          {/* ── Activity timeline ─────────────────────────────────────── */}
          {isManagement && feed?.recentActivity && (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Recent activity</h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Live
                </span>
              </div>

              <div className="bg-card border border-border rounded-lg card-shadow p-6">
                {feed.recentActivity.length > 0 ? (
                  <ol className="relative border-l border-border ml-3 space-y-6">
                    {feed.recentActivity.map((log) => {
                      let iconName = 'Info';
                      if (log.type === 'task') iconName = 'CheckSquare';
                      else if (log.type === 'leave') iconName = 'Calendar';

                      return (
                        <li key={log.id} className="relative pl-8">
                          <span className="absolute -left-[13px] top-0 w-[26px] h-[26px] rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center">
                            <Icon name={iconName} size={13} />
                          </span>
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-foreground leading-snug">{log.message}</p>
                            <span className="text-xs text-muted-foreground shrink-0 font-data">{log.time}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/80 capitalize">{log.type}</span>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Icon name="Inbox" size={28} />
                    <p className="text-sm">Nothing yet — activity will appear here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
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
