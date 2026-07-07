import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BreakTracker = ({ attendanceStatus, onBreakToggle }) => {
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [currentBreakDuration, setCurrentBreakDuration] = useState('0m');
  const [totalBreakTime, setTotalBreakTime] = useState('0h 15m');
  const [breaks, setBreaks] = useState([
    { 
      id: 1, 
      type: 'lunch', 
      startTime: '12:30 PM', 
      endTime: '01:00 PM', 
      duration: '30m',
      status: 'completed'
    }
  ]);

  const breakTypes = [
    { 
      id: 'lunch', 
      label: 'Lunch Break', 
      icon: 'Utensils', 
      color: 'text-orange-500',
      defaultDuration: 60,
      maxDuration: 90
    },
    { 
      id: 'tea', 
      label: 'Tea/Coffee Break', 
      icon: 'Coffee', 
      color: 'text-amber-600',
      defaultDuration: 15,
      maxDuration: 30
    },
    { 
      id: 'meeting', 
      label: 'Meeting Break', 
      icon: 'Users', 
      color: 'text-primary',
      defaultDuration: 30,
      maxDuration: 60
    },
    { 
      id: 'personal', 
      label: 'Personal Break', 
      icon: 'User', 
      color: 'text-purple-500',
      defaultDuration: 10,
      maxDuration: 30
    }
  ];

  // Update break duration every minute when on break
  useEffect(() => {
    let timer;
    if (attendanceStatus?.isOnBreak && breakStartTime) {
      timer = setInterval(() => {
        const now = new Date();
        const start = new Date(breakStartTime);
        const diff = now - start;
        const minutes = Math.floor(diff / (1000 * 60));
        setCurrentBreakDuration(`${minutes}m`);
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [attendanceStatus?.isOnBreak, breakStartTime]);

  const handleBreakStart = (breakType) => {
    const now = new Date();
    setBreakStartTime(now);
    setCurrentBreakDuration('0m');
    onBreakToggle();
    
    console.log('Break started:', breakType, 'at', now);
  };

  const handleBreakEnd = () => {
    if (breakStartTime) {
      const now = new Date();
      const duration = Math.floor((now - breakStartTime) / (1000 * 60));
      
      const newBreak = {
        id: Date.now(),
        type: 'general',
        startTime: breakStartTime?.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        endTime: now?.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        duration: `${duration}m`,
        status: 'completed'
      };
      
      setBreaks(prev => [...prev, newBreak]);
      setBreakStartTime(null);
      setCurrentBreakDuration('0m');
      
      // Update total break time
      const totalMinutes = breaks?.reduce((acc, b) => {
        const mins = parseInt(b?.duration?.match(/(\d+)m/)?.[1] || '0');
        return acc + mins;
      }, duration);
      
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      setTotalBreakTime(`${hours}h ${mins}m`);
    }
    
    onBreakToggle();
  };

  const getBreakTypeInfo = (type) => {
    return breakTypes?.find(bt => bt?.id === type) || {
      id: 'general',
      label: 'Break',
      icon: 'Clock',
      color: 'text-muted-foreground'
    };
  };

  if (!attendanceStatus?.isCheckedIn) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Coffee" size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Break Tracker</h3>
        </div>
        
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Clock" size={48} className="mx-auto mb-3" />
          <p className="text-sm">Check in to start tracking breaks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Coffee" size={20} className="text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Break Tracker</h3>
        </div>
        
        <div className="text-right text-sm">
          <div className="font-medium text-foreground">{totalBreakTime}</div>
          <div className="text-muted-foreground">Total Today</div>
        </div>
      </div>

      {/* Current Break Status */}
      {attendanceStatus?.isOnBreak ? (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
              <span className="font-medium text-warning">On Break</span>
            </div>
            <span className="font-mono text-warning">{currentBreakDuration}</span>
          </div>
          
          <Button
            onClick={handleBreakEnd}
            size="sm"
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            <Icon name="Play" size={16} className="mr-2" />
            Resume Work
          </Button>
        </div>
      ) : (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Start Break</h4>
          <div className="grid grid-cols-2 gap-2">
            {breakTypes?.slice(0, 4)?.map((breakType) => (
              <button
                key={breakType?.id}
                onClick={() => handleBreakStart(breakType?.id)}
                className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-150 text-left"
              >
                <Icon name={breakType?.icon} size={16} className={breakType?.color} />
                <div>
                  <div className="text-xs font-medium text-foreground">{breakType?.label}</div>
                  <div className="text-xs text-muted-foreground">{breakType?.defaultDuration}min</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Break History */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Today's Breaks</h4>
        {breaks?.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {breaks?.map((breakItem) => {
              const typeInfo = getBreakTypeInfo(breakItem?.type);
              return (
                <div key={breakItem?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name={typeInfo?.icon} size={16} className={typeInfo?.color} />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {typeInfo?.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {breakItem?.startTime} - {breakItem?.endTime}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-foreground">
                    {breakItem?.duration}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Icon name="Coffee" size={24} className="mx-auto mb-2" />
            <p className="text-sm">No breaks taken yet</p>
          </div>
        )}
      </div>

      {/* Break Limits */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Daily Break Limit</span>
          <span className="text-foreground">2h 0m</span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="bg-warning h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(() => {
                const totalMinutes = breaks?.reduce((acc, b) => {
                  const mins = parseInt(b?.duration?.match(/(\d+)m/)?.[1] || '0');
                  return acc + mins;
                }, 0);
                return Math.min((totalMinutes / 120) * 100, 100); // 2 hours = 120 minutes
              })()}%`
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0h</span>
          <span>2h (Limit)</span>
        </div>
      </div>
    </div>
  );
};

export default BreakTracker;