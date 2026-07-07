import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const ActivityChart = () => {
  const applicationUsageData = [
    { name: 'VS Code', hours: 4.2, color: '#007ACC' },
    { name: 'Chrome', hours: 2.8, color: '#4285F4' },
    { name: 'Slack', hours: 1.5, color: '#4A154B' },
    { name: 'Excel', hours: 2.1, color: '#217346' },
    { name: 'Figma', hours: 1.8, color: '#F24E1E' },
    { name: 'Other', hours: 1.6, color: '#6B7280' }
  ];

  const productivityData = [
    { time: '9:00', productive: 85, idle: 15 },
    { time: '10:00', productive: 92, idle: 8 },
    { time: '11:00', productive: 78, idle: 22 },
    { time: '12:00', productive: 45, idle: 55 },
    { time: '13:00', productive: 88, idle: 12 },
    { time: '14:00', productive: 95, idle: 5 },
    { time: '15:00', productive: 82, idle: 18 },
    { time: '16:00', productive: 89, idle: 11 },
    { time: '17:00', productive: 76, idle: 24 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-sm">
          <p className="text-sm font-medium text-popover-foreground">{`Time: ${label}`}</p>
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

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-sm">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">{`${data?.value} hours`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Application Usage Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="PieChart" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Application Usage</h3>
          </div>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View Details
          </button>
        </div>
        
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={applicationUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="hours"
              >
                {applicationUsageData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {applicationUsageData?.map((app, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: app?.color }}
              ></div>
              <span className="text-sm text-muted-foreground">{app?.name}</span>
              <span className="text-sm font-medium text-foreground ml-auto">{app?.hours}h</span>
            </div>
          ))}
        </div>
      </div>
      {/* Productivity Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="BarChart3" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Productivity Timeline</h3>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Productive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Idle</span>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="productive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="idle" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Average Productivity: <span className="font-medium text-green-600">82%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Peak Hours: <span className="font-medium text-foreground">2:00 PM - 3:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;