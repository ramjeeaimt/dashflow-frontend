import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Icon from '../../../components/AppIcon';
import AppImage from '../../../components/AppImage';

const AttendanceSummary = ({ attendanceStatus, employeeData }) => {
  // Mock data for the summary
  const monthlyStats = {
    attendanceRate: 96,
    punctualityRate: 87,
    productivityScore: 91,
    overtimeHours: 12.5,
    totalWorkHours: 184.5,
    expectedHours: 192,
    leaveBalance: {
      annual: 15,
      sick: 8,
      personal: 5
    },
    achievements: [
      { 
        id: 1, 
        title: 'Perfect Week', 
        description: 'No late arrivals this week',
        icon: 'Award',
        color: 'text-success',
        bgColor: 'bg-success/10'
      },
      { 
        id: 2, 
        title: 'Productivity Star', 
        description: '90%+ productivity 5 days in a row',
        icon: 'Star',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      },
      { 
        id: 3, 
        title: 'Team Player', 
        description: 'Helped 3 colleagues this week',
        icon: 'Users',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      }
    ]
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      time: '10:00 AM',
      type: 'meeting',
      icon: 'Users',
      color: 'text-primary'
    },
    {
      id: 2,
      title: 'Lunch Break',
      time: '12:30 PM',
      type: 'break',
      icon: 'Coffee',
      color: 'text-orange-500'
    },
    {
      id: 3,
      title: 'Project Review',
      time: '03:00 PM',
      type: 'meeting',
      icon: 'FileText',
      color: 'text-purple-500'
    }
  ];

  const getProgressColor = (rate) => {
    if (rate >= 95) return '#22c55e'; // success
    if (rate >= 85) return '#f59e0b'; // warning
    if (rate >= 70) return '#f97316'; // orange
    return '#ef4444'; // error
  };

  return (
    <div className="space-y-6">
      {/* Employee Profile Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <AppImage
            src={employeeData?.profileImage}
            alt={employeeData?.alt}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{employeeData?.name}</h3>
            <div className="text-sm text-muted-foreground">{employeeData?.employeeId}</div>
            <div className="text-sm text-muted-foreground">{employeeData?.department}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold text-success">98%</div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold text-primary">15</div>
            <div className="text-xs text-muted-foreground">Streak Days</div>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Attendance Rate */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2">
              <CircularProgressbar
                value={monthlyStats?.attendanceRate}
                text={`${monthlyStats?.attendanceRate}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: getProgressColor(monthlyStats?.attendanceRate),
                  textColor: 'hsl(var(--foreground))',
                  trailColor: 'hsl(var(--muted))',
                })}
              />
            </div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>

          {/* Punctuality */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2">
              <CircularProgressbar
                value={monthlyStats?.punctualityRate}
                text={`${monthlyStats?.punctualityRate}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: getProgressColor(monthlyStats?.punctualityRate),
                  textColor: 'hsl(var(--foreground))',
                  trailColor: 'hsl(var(--muted))',
                })}
              />
            </div>
            <div className="text-xs text-muted-foreground">Punctuality</div>
          </div>

          {/* Productivity */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2">
              <CircularProgressbar
                value={monthlyStats?.productivityScore}
                text={`${monthlyStats?.productivityScore}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: getProgressColor(monthlyStats?.productivityScore),
                  textColor: 'hsl(var(--foreground))',
                  trailColor: 'hsl(var(--muted))',
                })}
              />
            </div>
            <div className="text-xs text-muted-foreground">Productivity</div>
          </div>
        </div>

        {/* Work Hours Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Work Hours</span>
            <span className="font-mono text-foreground">
              {monthlyStats?.totalWorkHours}h / {monthlyStats?.expectedHours}h
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(monthlyStats?.totalWorkHours / monthlyStats?.expectedHours) * 100}%`
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overtime</span>
            <span className="font-mono text-orange-500">{monthlyStats?.overtimeHours}h</span>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Leave Balance</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-primary" />
              <span className="text-sm text-foreground">Annual Leave</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {monthlyStats?.leaveBalance?.annual} days
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Heart" size={16} className="text-error" />
              <span className="text-sm text-foreground">Sick Leave</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {monthlyStats?.leaveBalance?.sick} days
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="User" size={16} className="text-purple-500" />
              <span className="text-sm text-foreground">Personal Leave</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {monthlyStats?.leaveBalance?.personal} days
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Achievements</h3>
        
        <div className="space-y-3">
          {monthlyStats?.achievements?.map((achievement) => (
            <div key={achievement?.id} className={`p-3 rounded-lg ${achievement?.bgColor}`}>
              <div className="flex items-start space-x-3">
                <Icon name={achievement?.icon} size={16} className={achievement?.color} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {achievement?.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement?.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Schedule</h3>
        
        <div className="space-y-3">
          {upcomingEvents?.map((event) => (
            <div key={event?.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Icon name={event?.icon} size={16} className={event?.color} />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{event?.title}</div>
                <div className="text-xs text-muted-foreground">{event?.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => window.location.href = '/leave-request'}
            className="flex items-center justify-center space-x-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors duration-150"
          >
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Request Leave</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/task-management'}
            className="flex items-center justify-center space-x-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors duration-150"
          >
            <Icon name="CheckSquare" size={16} className="text-green-500" />
            <span className="text-sm text-foreground">View Tasks</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/time-tracking'}
            className="flex items-center justify-center space-x-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors duration-150"
          >
            <Icon name="Clock" size={16} className="text-orange-500" />
            <span className="text-sm text-foreground">Timesheet</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/reports'}
            className="flex items-center justify-center space-x-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors duration-150"
          >
            <Icon name="FileText" size={16} className="text-purple-500" />
            <span className="text-sm text-foreground">Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;