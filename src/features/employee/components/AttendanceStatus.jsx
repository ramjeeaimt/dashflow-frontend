import React from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceStatus = ({ attendanceStatus, currentTime }) => {
  const getWorkModeConfig = (mode) => {
    const configs = {
      office: { 
        icon: 'Building', 
        label: 'Office', 
        color: 'text-primary',
        bgColor: 'bg-primary/10 border-primary/20'
      },
      wfh: { 
        icon: 'Home', 
        label: 'Work From Home', 
        color: 'text-primary',
        bgColor: 'bg-primary/10 border-border'
      },
      client_site: { 
        icon: 'MapPin', 
        label: 'Client Site', 
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 border-orange-200'
      },
      field_work: { 
        icon: 'Truck', 
        label: 'Field Work', 
        color: 'text-green-500',
        bgColor: 'bg-green-50 border-green-200'
      }
    };
    return configs?.[mode] || configs?.office;
  };

  const statusMetrics = [
    {
      label: 'Session Duration',
      value: attendanceStatus?.currentSessionDuration || '0h 0m',
      icon: 'Clock',
      color: 'text-primary'
    },
    {
      label: 'Total Work Today',
      value: attendanceStatus?.totalWorkToday || '0h 0m',
      icon: 'Calendar',
      color: 'text-success'
    },
    {
      label: 'Break Time',
      value: attendanceStatus?.breakTime || '0h 0m',
      icon: 'Coffee',
      color: 'text-warning'
    }
  ];

  const workModeConfig = getWorkModeConfig(attendanceStatus?.workMode);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Current Status</h3>
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
 attendanceStatus?.isCheckedIn 
 ? 'bg-success/10 text-success border border-success/20' :'bg-muted text-muted-foreground border border-border'
 }`}>
          <div className={`w-2 h-2 rounded-full ${
 attendanceStatus?.isCheckedIn ? 'bg-success animate-pulse' : 'bg-muted-foreground'
 }`}></div>
          <span>
            {attendanceStatus?.isCheckedIn ? 'Active' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="space-y-4 mb-6">
        {attendanceStatus?.isCheckedIn ? (
          <>
            {/* Check-in Time */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="LogIn" size={18} className="text-success" />
                <span className="font-medium text-foreground">Checked In</span>
              </div>
              <span className="text-lg font-mono text-foreground">
                {attendanceStatus?.checkInTime 
                  ? new Date(attendanceStatus?.checkInTime)?.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                  : '--:--'
                }
              </span>
            </div>

            {/* Work Mode */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${workModeConfig?.bgColor}`}>
              <div className="flex items-center space-x-2">
                <Icon name={workModeConfig?.icon} size={18} className={workModeConfig?.color} />
                <span className="font-medium text-foreground">Work Mode</span>
              </div>
              <span className={`font-medium ${workModeConfig?.color}`}>
                {workModeConfig?.label}
              </span>
            </div>

            {/* Location */}
            {attendanceStatus?.location && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={18} className="text-primary" />
                  <span className="font-medium text-foreground">Location</span>
                </div>
                <span className="text-sm text-muted-foreground max-w-32 truncate" title={attendanceStatus?.location}>
                  {attendanceStatus?.location}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Icon name="UserX" size={48} className="mx-auto text-muted-foreground mb-3" />
            <h4 className="text-lg font-medium text-foreground mb-2">Not Checked In</h4>
            <p className="text-muted-foreground text-sm">
              Start your work session by checking in
            </p>
          </div>
        )}
      </div>

      {/* Time Metrics */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Today's Metrics</h4>
        {statusMetrics?.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name={metric?.icon} size={16} className={metric?.color} />
              <span className="text-sm text-muted-foreground">{metric?.label}</span>
            </div>
            <span className="text-sm font-mono font-medium text-foreground">
              {metric?.value}
            </span>
          </div>
        ))}
      </div>

      {/* Expected vs Actual */}
      {attendanceStatus?.isCheckedIn && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expected Hours Today</span>
              <span className="font-mono text-foreground">8h 0m</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono text-foreground">
                {(() => {
                  const current = attendanceStatus?.currentSessionDuration || '0h 0m';
                  const hours = parseInt(current?.match(/(\d+)h/)?.[1] || '0');
                  const minutes = parseInt(current?.match(/(\d+)m/)?.[1] || '0');
                  const totalMinutes = hours * 60 + minutes;
                  const percentage = Math.min((totalMinutes / 480) * 100, 100); // 8 hours = 480 minutes
                  return `${percentage?.toFixed(0)}%`;
                })()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(() => {
                    const current = attendanceStatus?.currentSessionDuration || '0h 0m';
                    const hours = parseInt(current?.match(/(\d+)h/)?.[1] || '0');
                    const minutes = parseInt(current?.match(/(\d+)m/)?.[1] || '0');
                    const totalMinutes = hours * 60 + minutes;
                    return Math.min((totalMinutes / 480) * 100, 100);
                  })()}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-success">98%</div>
            <div className="text-xs text-muted-foreground">Attendance Rate</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">15</div>
            <div className="text-xs text-muted-foreground">Days Streak</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning">2.5h</div>
            <div className="text-xs text-muted-foreground">Avg Overtime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatus;