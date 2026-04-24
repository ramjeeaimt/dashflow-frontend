import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import Icon from '../../../components/AppIcon';
import MetricsCard from '../components/MetricsCard';
import AttendanceTrendChart from '../components/AttendanceTrendChart';
import DepartmentAnalytics from '../components/DepartmentAnalytics';
import AnalyticsFilters from '../components/AnalyticsFilters';
import PredictiveInsights from '../components/PredictiveInsights';
import ExportPanel from '../components/ExportPanel';
import attendanceService from '../../../services/attendance.service';

const AttendanceAnalytics = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (selectedPeriod === 'weekly') {
        startDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (selectedPeriod === 'yearly') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const filters = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        departmentId: selectedDepartment
      };

      const data = await attendanceService.getAnalytics(filters);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch attendance analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, selectedDepartment]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Attendance Analytics', path: '/attendance-analytics' }
  ];

  const metricsData = [
    {
      title: 'Attendance Rate',
      value: `${analyticsData?.attendanceRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: 'UserCheck',
      color: 'success'
    },
    {
      title: 'Punctuality Score',
      value: `${analyticsData?.punctualityScore || 0}%`,
      change: '+1.8%',
      changeType: 'positive',
      icon: 'Clock',
      color: 'primary'
    },
    {
      title: 'Absenteeism Rate',
      value: `${analyticsData?.absenteeismRate || 0}%`,
      change: '-0.5%',
      changeType: 'positive',
      icon: 'UserX',
      color: 'warning'
    },
    {
      title: 'Overtime Hours',
      value: analyticsData?.overtimeHours?.toLocaleString() || '0',
      change: '+5.2%',
      changeType: 'negative',
      icon: 'Clock3',
      color: 'error'
    }
  ];

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleExportData = (format) => {
    console.log(`Exporting attendance analytics in ${format} format`);
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
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <BreadcrumbNavigation items={breadcrumbItems} />
              <h1 className="text-3xl font-semibold text-foreground mb-2">Attendance Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive workforce attendance insights and trend analysis for strategic decision-making.
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <ExportPanel onExport={handleExportData} />

              <button
                onClick={fetchAnalyticsData}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon name="RefreshCw" size={16} className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <AnalyticsFilters
            selectedPeriod={selectedPeriod}
            selectedDepartment={selectedDepartment}
            onPeriodChange={setSelectedPeriod}
            onDepartmentChange={setSelectedDepartment}
          />

          {isLoading && !analyticsData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground font-medium italic">Loading real-time analytics data...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricsData?.map((metric, index) => (
                  <MetricsCard
                    key={index}
                    title={metric?.title}
                    value={metric?.value}
                    change={metric?.change}
                    changeType={metric?.changeType}
                    icon={metric?.icon}
                    color={metric?.color}
                  />
                ))}
              </div>

              {/* Trend Analysis */}
              <div className="mb-8">
                <AttendanceTrendChart
                  data={analyticsData?.trends || []}
                  period={selectedPeriod}
                />
              </div>

              {/* Department Analytics & Predictive Insights */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <DepartmentAnalytics
                  data={analyticsData?.departmentStats || []}
                  selectedDepartment={selectedDepartment}
                />
                <PredictiveInsights />
              </div>

              {/* Compliance & Risk Indicators */}
              <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                <h3 className="text-lg font-semibold text-foreground mb-4">Compliance & Risk Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg group hover:bg-muted transition-colors duration-200">
                    <Icon name="Shield" size={32} className="text-success mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-foreground">{analyticsData?.complianceRate || 0}%</p>
                    <p className="text-sm text-muted-foreground">Policy Compliance</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg group hover:bg-muted transition-colors duration-200">
                    <Icon name="AlertTriangle" size={32} className="text-warning mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-foreground">{analyticsData?.atRiskCount || 0}</p>
                    <p className="text-sm text-muted-foreground">At-Risk Employees</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg group hover:bg-muted transition-colors duration-200">
                    <Icon name="TrendingUp" size={32} className="text-primary mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-foreground">+{analyticsData?.improvementRate || 0}%</p>
                    <p className="text-sm text-muted-foreground">Improvement Rate</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceAnalytics;