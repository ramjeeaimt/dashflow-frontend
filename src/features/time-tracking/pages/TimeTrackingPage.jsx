import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

// Import components
import TimerWidget from '../components/TimerWidget';
import TimesheetTable from '../components/TimesheetTable';
import ProductivityAnalytics from '../components/ProductivityAnalytics';
import ScreenshotMonitoring from '../components/ScreenshotMonitoring';
import ManualTimeEntry from '../components/ManualTimeEntry';

import timeTrackingService from '../../../services/time-tracking.service';
import useAuthStore from '../../../store/useAuthStore';

const TimeTrackingPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('timer');
  const [currentTask, setCurrentTask] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [timeEntries, setTimeEntries] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    // Determine which employee ID to fetch for
    // If Admin/HR, might fetch for selectedEmployee. 
    // If just Employee, fetch for self (user?.employeeId or user?.id depending on backend)
    // Assuming user object has employeeId attached or we use user.id which maps to Employee
    const targetEmployeeId = user?.employeeId;

    const fetchEntries = async () => {
      if (targetEmployeeId) {
        try {
          const data = await timeTrackingService.getAll(targetEmployeeId);
          setTimeEntries(data);
        } catch (error) {
          console.error("Failed to load time entries", error);
        }
      }
    };
    fetchEntries();
  }, [user, selectedEmployee]);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Time Tracking', path: '/time-tracking' }
  ];

  const tabOptions = [
    { id: 'timer', label: 'Timer', icon: 'Play' },
    { id: 'timesheet', label: 'Timesheet', icon: 'Clock' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'monitoring', label: 'Monitoring', icon: 'Monitor' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'emily-davis', label: 'Emily Davis' },
    { value: 'james-wilson', label: 'James Wilson' }
  ];

  const handleTimeUpdate = (elapsedTime) => {
    // Handle timer updates
    console.log('Timer updated:', elapsedTime);
  };

  const handleTaskChange = (task) => {
    setCurrentTask(task);
  };

  const handleEditEntry = (entry) => {
    console.log('Edit entry:', entry);
  };

  const handleDeleteEntry = (entryId) => {
    console.log('Delete entry:', entryId);
  };

  const handleAddManualEntry = (entry) => {
    console.log('Add manual entry:', entry);
    setShowManualEntry(false);
  };

  const handleExportTimesheet = () => {
    // Generate and download timesheet PDF
    console.log('Exporting timesheet...');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <div className="space-y-6">
            <TimerWidget
              onTimeUpdate={handleTimeUpdate}
              currentTask={currentTask}
              onTaskChange={handleTaskChange}
            />

            {showManualEntry && (
              <ManualTimeEntry
                onAddEntry={handleAddManualEntry}
                onClose={() => setShowManualEntry(false)}
              />
            )}
          </div>
        );

      case 'timesheet':
        return (
          <TimesheetTable
            entries={timeEntries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        );

      case 'analytics':
        return <ProductivityAnalytics />;

      case 'monitoring':
        return <ScreenshotMonitoring />;

      default:
        return null;
    }
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
      <main className={`pt-16 pb-8 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <div className="px-4 sm:px-6 md:px-8">
          <BreadcrumbNavigation items={breadcrumbItems} />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
              <p className="text-muted-foreground mt-2">
                Monitor productivity and manage work hours efficiently
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowManualEntry(!showManualEntry)}
                iconName="Plus"
                iconPosition="left"
              >
                Manual Entry
              </Button>

              <Button
                variant="outline"
                onClick={handleExportTimesheet}
                iconName="Download"
                iconPosition="left"
              >
                Export Report
              </Button>

              <Button
                variant="default"
                onClick={() => setActiveTab('timer')}
                iconName="Play"
                iconPosition="left"
              >
                Start Timer
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 card-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Select
                  label="Date Range"
                  options={dateRangeOptions}
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full sm:w-40"
                />

                <Select
                  label="Employee"
                  options={employeeOptions}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  className="w-full sm:w-48"
                />

                <div className="flex space-x-2">
                  <Input
                    type="date"
                    label="From"
                    className="w-full sm:w-36"
                  />
                  <Input
                    type="date"
                    label="To"
                    className="w-full sm:w-36"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Filter">
                  More Filters
                </Button>
                <Button variant="outline" size="sm" iconName="RefreshCw">
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-2xl mb-8 card-shadow">
            <div className="border-b border-border">
              <nav className="flex space-x-1 p-2">
                {tabOptions?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 ${activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Hours</p>
                  <p className="text-2xl font-bold text-foreground">7.5h</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Productivity</p>
                  <p className="text-2xl font-bold text-foreground">92%</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckSquare" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Done</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Coffee" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Break Time</p>
                  <p className="text-2xl font-bold text-foreground">45m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimeTrackingPage;