import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttendanceHistory = () => {
  const [viewMode, setViewMode] = useState('week'); // week, month
  
  const weeklyData = [
    {
      date: '2025-01-19',
      day: 'Today',
      checkIn: '09:00 AM',
      checkOut: 'In Progress',
      duration: '4h 30m',
      status: 'present',
      workMode: 'office',
      overtime: '0m',
      productivity: 85
    },
    {
      date: '2025-01-18',
      day: 'Saturday',
      checkIn: '--',
      checkOut: '--',
      duration: '--',
      status: 'weekend',
      workMode: '--',
      overtime: '--',
      productivity: 0
    },
    {
      date: '2025-01-17',
      day: 'Friday',
      checkIn: '09:15 AM',
      checkOut: '06:00 PM',
      duration: '8h 15m',
      status: 'late',
      workMode: 'wfh',
      overtime: '15m',
      productivity: 92
    },
    {
      date: '2025-01-16',
      day: 'Thursday',
      checkIn: '08:55 AM',
      checkOut: '05:30 PM',
      duration: '8h 05m',
      status: 'present',
      workMode: 'office',
      overtime: '5m',
      productivity: 88
    },
    {
      date: '2025-01-15',
      day: 'Wednesday',
      checkIn: '09:00 AM',
      checkOut: '04:45 PM',
      duration: '7h 15m',
      status: 'early_departure',
      workMode: 'client_site',
      overtime: '0m',
      productivity: 90,
      reason: 'Client Meeting'
    },
    {
      date: '2025-01-14',
      day: 'Tuesday',
      checkIn: '09:10 AM',
      checkOut: '06:15 PM',
      duration: '8h 35m',
      status: 'late',
      workMode: 'office',
      overtime: '35m',
      productivity: 87
    },
    {
      date: '2025-01-13',
      day: 'Monday',
      checkIn: '08:50 AM',
      checkOut: '05:45 PM',
      duration: '8h 25m',
      status: 'present',
      workMode: 'office',
      overtime: '25m',
      productivity: 91
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      present: { 
        color: 'bg-success/10 text-success border border-success/20', 
        label: 'Present', 
        icon: 'Check' 
      },
      late: { 
        color: 'bg-warning/10 text-warning border border-warning/20', 
        label: 'Late', 
        icon: 'Clock' 
      },
      early_departure: { 
        color: 'bg-orange-50 text-orange-600 border border-orange-200', 
        label: 'Early Out', 
        icon: 'LogOut' 
      },
      absent: { 
        color: 'bg-error/10 text-error border border-error/20', 
        label: 'Absent', 
        icon: 'X' 
      },
      weekend: { 
        color: 'bg-muted text-muted-foreground border border-border', 
        label: 'Weekend', 
        icon: 'Calendar' 
      }
    };
    return configs?.[status] || configs?.absent;
  };

  const getWorkModeConfig = (mode) => {
    const configs = {
      office: { icon: 'Building', label: 'Office', color: 'text-primary' },
      wfh: { icon: 'Home', label: 'WFH', color: 'text-primary' },
      client_site: { icon: 'MapPin', label: 'Client', color: 'text-orange-500' },
      field_work: { icon: 'Truck', label: 'Field', color: 'text-green-500' }
    };
    return configs?.[mode] || { icon: 'Circle', label: '--', color: 'text-muted-foreground' };
  };

  const weekStats = {
    totalDays: weeklyData?.filter(d => d?.status !== 'weekend')?.length,
    presentDays: weeklyData?.filter(d => ['present', 'late', 'early_departure']?.includes(d?.status))?.length,
    totalHours: weeklyData?.reduce((acc, d) => {
      if (d?.duration && d?.duration !== '--') {
        const hours = parseInt(d?.duration?.match(/(\d+)h/)?.[1] || '0');
        const minutes = parseInt(d?.duration?.match(/(\d+)m/)?.[1] || '0');
        return acc + hours + (minutes / 60);
      }
      return acc;
    }, 0),
    avgProductivity: weeklyData?.reduce((acc, d) => acc + (d?.productivity || 0), 0) / weeklyData?.length
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Attendance History</h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150 ${
 viewMode === 'week' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
 }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150 ${
 viewMode === 'month' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
 }`}
            >
              Month
            </button>
          </div>
          
          <Button variant="outline" size="sm">
            <Icon name="Download" size={14} className="mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{weekStats?.presentDays}/{weekStats?.totalDays}</div>
          <div className="text-xs text-muted-foreground">Attendance</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{weekStats?.totalHours?.toFixed(1)}h</div>
          <div className="text-xs text-muted-foreground">Total Hours</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{Math.round(weekStats?.avgProductivity)}%</div>
          <div className="text-xs text-muted-foreground">Avg Productivity</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-success">15</div>
          <div className="text-xs text-muted-foreground">Streak Days</div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {weeklyData?.map((record, index) => {
          const statusConfig = getStatusConfig(record?.status);
          const workModeConfig = getWorkModeConfig(record?.workMode);
          
          return (
            <div key={index} className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-150">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-foreground">
                    {record?.day}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(record?.date)?.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                    <Icon name={statusConfig?.icon} size={10} />
                    <span>{statusConfig?.label}</span>
                  </span>
                </div>
                
                {record?.productivity > 0 && (
                  <span className="text-xs font-medium text-success">
                    {record?.productivity}%
                  </span>
                )}
              </div>

              {record?.status !== 'weekend' && (
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">In: </span>
                    <span className="font-mono text-foreground">{record?.checkIn}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Out: </span>
                    <span className="font-mono text-foreground">{record?.checkOut}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-mono text-foreground">{record?.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name={workModeConfig?.icon} size={12} className={workModeConfig?.color} />
                    <span className="text-foreground text-xs">{workModeConfig?.label}</span>
                  </div>
                </div>
              )}

              {record?.overtime && record?.overtime !== '0m' && record?.overtime !== '--' && (
                <div className="mt-2 flex items-center space-x-2">
                  <Icon name="Clock" size={12} className="text-orange-500" />
                  <span className="text-xs text-orange-600">
                    Overtime: {record?.overtime}
                  </span>
                </div>
              )}

              {record?.reason && (
                <div className="mt-2 flex items-center space-x-2">
                  <Icon name="Info" size={12} className="text-primary" />
                  <span className="text-xs text-muted-foreground">{record?.reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendance Streak */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Flame" size={18} className="text-orange-500" />
            <span className="font-medium text-foreground">Current Streak</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-orange-500">15 Days</div>
            <div className="text-xs text-muted-foreground">Perfect Attendance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;