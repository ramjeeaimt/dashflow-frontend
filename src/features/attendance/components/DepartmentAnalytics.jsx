import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const DepartmentAnalytics = ({ data, selectedDepartment }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
          <p className="text-foreground font-medium mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {entry?.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getDepartmentIcon = (departmentName) => {
    const icons = {
      'Engineering': 'Code',
      'Sales': 'TrendingUp',
      'Marketing': 'Megaphone',
      'HR': 'Users',
      'Finance': 'DollarSign'
    };
    return icons?.[departmentName] || 'Building';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Department Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Comparative attendance and punctuality metrics across departments
        </p>
      </div>

      {/* Department Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {data?.slice(0, 4)?.map((dept, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border transition-all duration-200 ${
 selectedDepartment === dept?.name?.toLowerCase() 
 ? 'border-primary bg-primary/5' :'border-border bg-muted/20 hover:bg-muted/40'
 }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name={getDepartmentIcon(dept?.name)} size={16} className="text-primary" />
                <span className="font-medium text-foreground">{dept?.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{dept?.employees} employees</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Attendance</p>
                <p className="font-semibold text-foreground">{dept?.attendance}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Punctuality</p>
                <p className="font-semibold text-foreground">{dept?.punctuality}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[70, 100]}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="attendance" 
              fill="#3B82F6" 
              name="Attendance Rate"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="punctuality" 
              fill="#10B981" 
              name="Punctuality Score"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;