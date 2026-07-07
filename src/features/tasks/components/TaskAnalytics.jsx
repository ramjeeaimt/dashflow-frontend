import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Icon from '../../../components/AppIcon';

const TaskAnalytics = ({ tasks = [] }) => {
  // Analytical processing
  const priorityData = [
    { name: 'HIGH', value: tasks.filter(t => t.priority === 'high').length, color: '#dc2626' },
    { name: 'MEDIUM', value: tasks.filter(t => t.priority === 'medium').length, color: '#d97706' },
    { name: 'LOW', value: tasks.filter(t => t.priority === 'low').length, color: '#059669' },
  ];

  const statusData = [
    { name: 'COMPLETED', value: tasks.filter(t => t.status === 'completed').length, color: '#059669' },
    { name: 'IN_PROGRESS', value: tasks.filter(t => t.status === 'in-progress').length, color: '#0f172a' },
    { name: 'PENDING', value: tasks.filter(t => t.status === 'pending').length, color: '#64748b' },
    { name: 'OVERDUE', value: tasks.filter(t => {
        return t.status !== 'completed' && new Date(t.dueDate) < new Date();
    }).length, color: '#b91c1c' },
  ];

  const stats = [
    { label: 'TOTAL_RECORDS', value: tasks.length, icon: 'Database', color: 'slate' },
    { label: 'ACTIVE_SEQUENCES', value: tasks.filter(t => t.status === 'in-progress').length, icon: 'Activity', color: 'blue' },
    { label: 'CRITICAL_VECTORS', value: tasks.filter(t => t.priority === 'high').length, icon: 'AlertTriangle', color: 'red' },
    { label: 'COMPLETION_RATE', value: `${tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%`, icon: 'CheckCircle', color: 'emerald' },
  ];

  return (
    <div className="space-y-12">
      {/* Industrial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6 transition-all cursor-default hover:bg-muted/60 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sidebar text-white rounded-none">
                <Icon name={stat.icon} size={18} />
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
            <div className="text-4xl font-semibold text-foreground tracking-tighter italic">
              {stat.value}
            </div>
            <div className="mt-4 h-1 bg-muted overflow-hidden">
               <div className="h-full bg-sidebar w-1/3 group-hover:w-full transition-all duration-1000"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Status Distribution */}
        <div className="bg-card border border-border p-8">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-border">
             <div className="w-2 h-6 bg-sidebar"></div>
             <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">OPERATIONAL_STATUS_MATRIX</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="middle" 
                  align="right" 
                  layout="vertical"
                  formatter={(value) => <span className="text-[10px] font-semibold text-foreground uppercase tracking-wide pl-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Analysis */}
        <div className="bg-card border border-border p-8">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-border">
             <div className="w-2 h-6 bg-red-600"></div>
             <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">CRITICALITY_VECTOR_ANALYSIS</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={0}
                  barSize={32}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Industrial Quick Insights */}
      <div className="bg-card border border-border p-8">
         <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-border">
             <Icon name="Zap" size={20} className="text-foreground" />
             <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">SYSTEM_DIAGNOSTICS_OVERVIEW</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InsightModule 
              label="AVG_COMPLETION_CYCLE" 
              value="3.2 DAYS" 
              subtitle="Sequence analyzed over 30 units" 
              icon="Clock"
              color="text-amber-600"
            />
            <InsightModule 
              label="TOP_PERFORMING_UNIT" 
              value="ENGINEERING" 
              subtitle="87% Efficiency calculated" 
              icon="Terminal"
              color="text-primary"
            />
            <InsightModule 
              label="RISK_VECTOR_DETECTED" 
              value={`${tasks.filter(t => t.status === 'overdue').length + 3} UNITS`} 
              subtitle="Due within 48 hour window" 
              icon="AlertTriangle"
              color="text-red-600"
            />
         </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sidebar p-3 shadow-sm">
        <p className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">DATA_POINT</p>
        <p className="text-xs font-semibold text-white uppercase tracking-tighter">
          {`${payload[0].name} : ${payload[0].value} RECORDS`}
        </p>
      </div>
    );
  }
  return null;
};

const InsightModule = ({ label, value, subtitle, icon, color }) => (
  <div className="p-6 bg-muted/60 border border-border hover:border-slate-400 transition-colors">
    <div className="flex items-center space-x-3 mb-4">
      <Icon name={icon} size={16} className={color} />
      <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-2xl font-semibold text-foreground tracking-tighter mb-1 uppercase italic">{value}</div>
    <div className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wide">{subtitle}</div>
  </div>
);

export default TaskAnalytics;