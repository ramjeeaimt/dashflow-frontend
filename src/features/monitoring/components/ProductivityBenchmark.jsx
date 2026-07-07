import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const ProductivityBenchmark = () => {
  const weeklyTrends = [
    { day: 'Mon', current: 85, average: 78, target: 80 },
    { day: 'Tue', current: 92, average: 82, target: 80 },
    { day: 'Wed', current: 78, average: 79, target: 80 },
    { day: 'Thu', current: 88, average: 81, target: 80 },
    { day: 'Fri', current: 95, average: 83, target: 80 },
    { day: 'Sat', current: 72, average: 65, target: 70 },
    { day: 'Sun', current: 68, average: 60, target: 70 }
  ];

  const departmentScores = [
    { name: 'Engineering', score: 92, target: 85, color: '#3b82f6' },
    { name: 'Marketing', score: 88, target: 80, color: '#10b981' },
    { name: 'Sales', score: 85, target: 82, color: '#f59e0b' },
    { name: 'Design', score: 90, target: 85, color: '#8b5cf6' },
    { name: 'HR', score: 78, target: 75, color: '#ef4444' }
  ];

  const overallMetrics = [
    {
      label: 'Team Average',
      value: 87,
      target: 80,
      trend: '+5%',
      icon: 'TrendingUp',
      color: 'text-green-600'
    },
    {
      label: 'Focus Time',
      value: 6.2,
      target: 6.0,
      trend: '+3%',
      icon: 'Clock',
      color: 'text-primary',
      unit: 'hrs'
    },
    {
      label: 'Idle Time',
      value: 12,
      target: 15,
      trend: '-20%',
      icon: 'Pause',
      color: 'text-green-600',
      unit: '%'
    },
    {
      label: 'Task Completion',
      value: 94,
      target: 90,
      trend: '+4%',
      icon: 'CheckCircle',
      color: 'text-green-600',
      unit: '%'
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-sm">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {`${entry?.dataKey}: ${entry?.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overallMetrics?.map((metric, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon name={metric?.icon} size={20} className="text-primary" />
              <span className={`text-sm font-medium ${metric?.color}`}>
                {metric?.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {metric?.value}{metric?.unit}
              </p>
              <p className="text-sm text-muted-foreground">{metric?.label}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Target: {metric?.target}{metric?.unit}</span>
                <div className={`w-2 h-2 rounded-full ${
 metric?.value >= metric?.target ? 'bg-green-500' : 'bg-yellow-500'
 }`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Weekly Productivity Trends</h3>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Current Week</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-muted-foreground">Average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Target</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#9ca3af', strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Benchmarks */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon name="BarChart3" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Department Benchmarks</h3>
            </div>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {departmentScores?.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{dept?.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Target: {dept?.target}%</span>
                    <span className={`text-sm font-medium ${
 dept?.score >= dept?.target ? 'text-green-600' : 'text-yellow-600'
 }`}>
                      {dept?.score}%
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${dept?.score}%`,
                        backgroundColor: dept?.color
                      }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 w-0.5 h-2 bg-gray-400"
                    style={{ left: `${dept?.target}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Company Average:</span>
              <span className="font-medium text-foreground">87%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Industry Benchmark:</span>
              <span className="font-medium text-foreground">82%</span>
            </div>
          </div>
        </div>
      </div>
      {/* Alerts & Recommendations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="AlertTriangle" size={20} className="text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Productivity Alerts & Recommendations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Icon name="Clock" size={16} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Extended Idle Time Detected</p>
                <p className="text-xs text-yellow-700 mt-1">3 employees have idle time &gt; 30 minutes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-primary/10 border border-border rounded-lg">
              <Icon name="TrendingUp" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Productivity Peak Identified</p>
                <p className="text-xs text-primary mt-1">Team performs best between 2-4 PM</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Target Achievement</p>
                <p className="text-xs text-green-700 mt-1">Engineering team exceeded weekly goals</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-primary/10 border border-border rounded-lg">
              <Icon name="Users" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">Team Collaboration</p>
                <p className="text-xs text-primary mt-1">Increase in cross-department meetings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityBenchmark;