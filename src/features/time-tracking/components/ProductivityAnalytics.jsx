import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProductivityAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('productivity');

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const metricOptions = [
    { value: 'productivity', label: 'Productivity Score' },
    { value: 'hours', label: 'Hours Worked' },
    { value: 'tasks', label: 'Tasks Completed' },
    { value: 'focus', label: 'Focus Time' }
  ];

  const weeklyProductivityData = [
    { day: 'Mon', productivity: 92, hours: 8.5, tasks: 12, focus: 85 },
    { day: 'Tue', productivity: 88, hours: 7.8, tasks: 10, focus: 78 },
    { day: 'Wed', productivity: 95, hours: 9.2, tasks: 15, focus: 92 },
    { day: 'Thu', productivity: 87, hours: 8.0, tasks: 11, focus: 82 },
    { day: 'Fri', productivity: 91, hours: 8.3, tasks: 13, focus: 88 },
    { day: 'Sat', productivity: 76, hours: 4.5, tasks: 6, focus: 70 },
    { day: 'Sun', productivity: 0, hours: 0, tasks: 0, focus: 0 }
  ];

  const applicationUsageData = [
    { name: 'VS Code', value: 35, color: '#007ACC', hours: 28.5 },
    { name: 'Browser', value: 25, color: '#FF6B35', hours: 20.3 },
    { name: 'Slack', value: 15, color: '#4A154B', hours: 12.2 },
    { name: 'Figma', value: 12, color: '#F24E1E', hours: 9.8 },
    { name: 'Terminal', value: 8, color: '#000000', hours: 6.5 },
    { name: 'Other', value: 5, color: '#6B7280', hours: 4.1 }
  ];

  const focusTimeData = [
    { time: '9:00', focus: 45, interruptions: 2 },
    { time: '10:00', focus: 78, interruptions: 1 },
    { time: '11:00', focus: 92, interruptions: 0 },
    { time: '12:00', focus: 65, interruptions: 3 },
    { time: '13:00', focus: 30, interruptions: 5 },
    { time: '14:00', focus: 85, interruptions: 1 },
    { time: '15:00', focus: 88, interruptions: 0 },
    { time: '16:00', focus: 72, interruptions: 2 },
    { time: '17:00', focus: 55, interruptions: 4 }
  ];

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'productivity': return 'Productivity %';
      case 'hours': return 'Hours';
      case 'tasks': return 'Tasks';
      case 'focus': return 'Focus %';
      default: return 'Value';
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case 'productivity': return '#059669';
      case 'hours': return '#1e40af';
      case 'tasks': return '#ea580c';
      case 'focus': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const averageProductivity = weeklyProductivityData?.reduce((sum, day) => sum + day?.productivity, 0) / weeklyProductivityData?.filter(day => day?.productivity > 0)?.length;
  const totalHours = weeklyProductivityData?.reduce((sum, day) => sum + day?.hours, 0);
  const totalTasks = weeklyProductivityData?.reduce((sum, day) => sum + day?.tasks, 0);
  const averageFocus = weeklyProductivityData?.reduce((sum, day) => sum + day?.focus, 0) / weeklyProductivityData?.filter(day => day?.focus > 0)?.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Productivity Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze your work patterns and productivity trends
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            className="w-full sm:w-40"
          />
          <Select
            options={metricOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
            className="w-full sm:w-48"
          />
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Productivity</p>
              <p className="text-2xl font-bold text-foreground">{averageProductivity?.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold text-foreground">{totalHours?.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckSquare" size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Done</p>
              <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Focus</p>
              <p className="text-2xl font-bold text-foreground">{averageFocus?.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Weekly Trend</h3>
            <Button variant="outline" size="sm" iconName="Download">
              Export
            </Button>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProductivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-popover-foreground)'
                  }}
                />
                <Bar 
                  dataKey={selectedMetric} 
                  fill={getMetricColor(selectedMetric)}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Usage */}
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Application Usage</h3>
            <Button variant="outline" size="sm" iconName="MoreHorizontal" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {applicationUsageData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-popover-foreground)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {applicationUsageData?.map((app, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: app?.color }}
                  ></div>
                  <span className="text-sm text-foreground">{app?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">{app?.value}%</span>
                  <span className="text-xs text-muted-foreground ml-2">{app?.hours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Time Analysis */}
        <div className="bg-card border border-border rounded-lg p-6 card-shadow lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Focus Time Analysis</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs text-muted-foreground">Focus %</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-xs text-muted-foreground">Interruptions</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-popover-foreground)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="interruptions" 
                  stroke="var(--color-destructive)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-destructive)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Insights */}
      <div className="bg-card border border-border rounded-lg p-6 card-shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">Productivity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="TrendingUp" size={20} className="text-success mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Peak Performance</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your most productive hours are between 11:00 AM - 3:00 PM with 88% average focus.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Improvement Area</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider reducing interruptions during lunch hours to maintain focus levels.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Target" size={20} className="text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Weekly Goal</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You're 85% towards your weekly productivity goal of 90% average score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityAnalytics;