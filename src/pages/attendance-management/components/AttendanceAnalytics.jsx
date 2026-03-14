import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const AttendanceAnalytics = ({ analyticsData }) => {
  <></>
  // if (!analyticsData) {
  //   return (
  //     <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
  //       <span className="text-muted-foreground">Loading analytics...</span>
  //     </div>
  //   );
  // }

  // const { weeklyTrend, distribution, punctualityTrend } = analyticsData;

  // Transform distribution data for PieChart
  // const attendanceDistribution = distribution?.map(item => ({
  //   name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
  //   value: item.value,
  //   color: item.name === 'present' ? '#22c55e' :
  //     item.name === 'absent' ? '#ef4444' :
  //       item.name === 'late' ? '#f59e0b' : '#f97316'
  // })) || [];

  // Mock department stats for now as backend doesn't provide it yet
  // const departmentStats = [
  //   { name: 'Engineering', present: 85, total: 92, rate: 92.4 },
  //   { name: 'Marketing', present: 28, total: 32, rate: 87.5 },
  //   { name: 'Sales', present: 45, total: 48, rate: 93.8 },
  //   { name: 'HR', present: 12, total: 15, rate: 80.0 },
  //   { name: 'Finance', present: 18, total: 20, rate: 90.0 }
  // ];

  // return (
  //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //     {/* Weekly Attendance Trend */}
  //     <div className="bg-card border border-border rounded-lg p-6">
  //       <div className="flex items-center justify-between mb-4">
  //         <h3 className="text-lg font-semibold text-foreground">Weekly Attendance Trend</h3>
  //         <Icon name="TrendingUp" size={20} className="text-primary" />
  //       </div>
  //       <div className="h-64">
  //         <ResponsiveContainer width="100%" height="100%">
  //           <BarChart data={weeklyTrend}>
  //             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
  //             <XAxis
  //               dataKey="day"
  //               stroke="hsl(var(--muted-foreground))"
  //               fontSize={12}
  //             />
  //             <YAxis
  //               stroke="hsl(var(--muted-foreground))"
  //               fontSize={12}
  //             />
  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: 'hsl(var(--card))',
  //                 border: '1px solid hsl(var(--border))',
  //                 borderRadius: '8px'
  //               }}
  //             />
  //             <Bar dataKey="present" fill="#22c55e" name="Present" />
  //             <Bar dataKey="late" fill="#f59e0b" name="Late" />
  //             <Bar dataKey="absent" fill="#ef4444" name="Absent" />
  //           </BarChart>
  //         </ResponsiveContainer>
  //       </div>
  //     </div>

  //     {/* Attendance Distribution */}
  //     <div className="bg-card border border-border rounded-lg p-6">
  //       <div className="flex items-center justify-between mb-4">
  //         <h3 className="text-lg font-semibold text-foreground">Attendance Distribution</h3>
  //         <Icon name="PieChart" size={20} className="text-primary" />
  //       </div>
  //       <div className="h-64 flex items-center">
  //         <ResponsiveContainer width="60%" height="100%">
  //           <PieChart>
  //             <Pie
  //               data={attendanceDistribution}
  //               cx="50%"
  //               cy="50%"
  //               innerRadius={40}
  //               outerRadius={80}
  //               dataKey="value"
  //             >
  //               {attendanceDistribution?.map((entry, index) => (
  //                 <Cell key={`cell-${index}`} fill={entry?.color} />
  //               ))}
  //             </Pie>
  //             <Tooltip />
  //           </PieChart>
  //         </ResponsiveContainer>
  //         <div className="flex-1 space-y-2">
  //           {attendanceDistribution?.map((item, index) => (
  //             <div key={index} className="flex items-center justify-between">
  //               <div className="flex items-center space-x-2">
  //                 <div
  //                   className="w-3 h-3 rounded-full"
  //                   style={{ backgroundColor: item?.color }}
  //                 ></div>
  //                 <span className="text-sm text-foreground">{item?.name}</span>
  //               </div>
  //               <span className="text-sm font-medium text-foreground">{item?.value}%</span>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>

  //     {/* Department Performance */}
  //     <div className="bg-card border border-border rounded-lg p-6">
  //       <div className="flex items-center justify-between mb-4">
  //         <h3 className="text-lg font-semibold text-foreground">Department Performance</h3>
  //         <Icon name="Building" size={20} className="text-primary" />
  //       </div>
  //       <div className="space-y-4">
  //         {departmentStats?.map((dept, index) => (
  //           <div key={index} className="flex items-center justify-between">
  //             <div className="flex-1">
  //               <div className="flex items-center justify-between mb-1">
  //                 <span className="text-sm font-medium text-foreground">{dept?.name}</span>
  //                 <span className="text-sm text-muted-foreground">{dept?.present}/{dept?.total}</span>
  //               </div>
  //               <div className="w-full bg-muted rounded-full h-2">
  //                 <div
  //                   className="bg-success h-2 rounded-full transition-all duration-300"
  //                   style={{ width: `${dept?.rate}%` }}
  //                 ></div>
  //               </div>
  //             </div>
  //             <div className="ml-4 text-right">
  //               <span className="text-sm font-semibold text-foreground">{dept?.rate}%</span>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>

  //     {/* Punctuality Trend */}
  //     <div className="bg-card border border-border rounded-lg p-6">
  //       <div className="flex items-center justify-between mb-4">
  //         <h3 className="text-lg font-semibold text-foreground">6-Month Punctuality Trend</h3>
  //         <Icon name="Clock" size={20} className="text-primary" />
  //       </div>
  //       <div className="h-64">
  //         <ResponsiveContainer width="100%" height="100%">
  //           <LineChart data={punctualityTrend}>
  //             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
  //             <XAxis
  //               dataKey="month"
  //               stroke="hsl(var(--muted-foreground))"
  //               fontSize={12}
  //             />
  //             <YAxis
  //               stroke="hsl(var(--muted-foreground))"
  //               fontSize={12}
  //             />
  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: 'hsl(var(--card))',
  //                 border: '1px solid hsl(var(--border))',
  //                 borderRadius: '8px'
  //               }}
  //             />
  //             <Line
  //               type="monotone"
  //               dataKey="onTime"
  //               stroke="#22c55e"
  //               strokeWidth={3}
  //               name="On Time"
  //               dot={{ r: 4 }}
  //             />
  //             <Line
  //               type="monotone"
  //               dataKey="late"
  //               stroke="#f59e0b"
  //               strokeWidth={2}
  //               name="Late"
  //               dot={{ r: 3 }}
  //             />
  //             <Line
  //               type="monotone"
  //               dataKey="earlyOut"
  //               stroke="#f97316"
  //               strokeWidth={2}
  //               name="Early Out"
  //               dot={{ r: 3 }}
  //             />
  //           </LineChart>
  //         </ResponsiveContainer>
  //       </div>
  //     </div>
    // </div>

};

export default AttendanceAnalytics;