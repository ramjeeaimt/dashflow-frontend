import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import EmployeeStatusCard from '../components/EmployeeStatusCard';
import ScreenshotGallery from '../components/ScreenshotGallery';
import ActivityChart from '../components/ActivityChart';
import MonitoringFilters from '../components/MonitoringFilters';
import CameraMonitoringPanel from '../components/CameraMonitoringPanel';
import ProductivityBenchmark from '../components/ProductivityBenchmark';
import Icon from '../../../components/AppIcon';

import { employeeService } from '../../../services/employee.service';
import useAuthStore from '../../../store/useAuthStore';

const MonitoringDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({});
  const [employees, setEmployees] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (user?.company?.id) {
        try {
          const data = await employeeService.getAll(user.company.id);
          // Transform to monitoring format
          const formatted = (data || []).map(emp => ({
            id: emp.id,
            name: `${emp.user?.firstName} ${emp.user?.lastName}`,
            department: emp.department?.name || 'N/A',
            avatar: emp.user?.avatar,
            workMode: 'Office', // Default, needs backend support
            status: 'Active', // Default
            productivityScore: 85, // Default
            hoursWorked: 0,
            lastActivity: 'Just now',
            currentTask: 'N/A',
            cameraEnabled: true,
            screenMonitoring: true
          }));
          setEmployees(formatted);
        } catch (error) {
          console.error("Failed to load monitoring data", error);
        }
      }
    };
    fetchEmployees();
  }, [user]);


  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'activity', label: 'Activity Tracking', icon: 'BarChart3' },
    { id: 'screenshots', label: 'Screenshots', icon: 'Camera' },
    { id: 'camera', label: 'Camera Monitoring', icon: 'Video' },
    { id: 'benchmarks', label: 'Benchmarks', icon: 'TrendingUp' }];


  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Apply filters to employee data
    console.log('Filters updated:', newFilters);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const selectedEmployee = employees?.find((emp) => emp?.workMode === 'WFH') || employees?.[0];
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Monitoring', path: '/monitoring-dashboard' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`pt-16 pb-8 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <div className="p-4 sm:p-6">
          <BreadcrumbNavigation items={breadcrumbItems} />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Monitoring Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive employee productivity and activity oversight
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Monitoring Active</span>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Icon name="RefreshCw" size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Monitoring Filters */}
          <MonitoringFilters onFiltersChange={handleFiltersChange} />

          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs?.map((tab, index) =>
                <button
                  key={tab?.id || `monitoring-tab-${index}`}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab?.id ?
                    'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'}`
                  }>

                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' &&
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">24</p>
                        <p className="text-sm text-muted-foreground">Total Employees</p>
                      </div>
                      <Icon name="Users" size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">18</p>
                        <p className="text-sm text-muted-foreground">Currently Active</p>
                      </div>
                      <Icon name="Activity" size={24} className="text-green-600" />
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">87%</p>
                        <p className="text-sm text-muted-foreground">Avg Productivity</p>
                      </div>
                      <Icon name="TrendingUp" size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">12</p>
                        <p className="text-sm text-muted-foreground">WFH Employees</p>
                      </div>
                      <Icon name="Home" size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Employee Status Cards */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Employee Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees?.map((employee, index) =>
                      <EmployeeStatusCard key={employee?.id || `monitoring-card-${index}`} employee={employee} />
                    )}
                  </div>
                </div>
              </>
            }

            {activeTab === 'activity' &&
              <ActivityChart />
            }

            {activeTab === 'screenshots' &&
              <ScreenshotGallery employee={selectedEmployee} />
            }

            {activeTab === 'camera' &&
              <CameraMonitoringPanel />
            }

            {activeTab === 'benchmarks' &&
              <ProductivityBenchmark />
            }
          </div>
        </div>
      </main>
    </div>);

};

export default MonitoringDashboard;