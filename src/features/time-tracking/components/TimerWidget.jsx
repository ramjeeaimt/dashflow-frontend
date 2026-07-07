import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TimerWidget = ({ onTimeUpdate, currentTask, onTaskChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  const taskOptions = [
    { value: 'development', label: 'Software Development' },
    { value: 'meeting', label: 'Team Meeting' },
    { value: 'review', label: 'Code Review' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'testing', label: 'Quality Testing' },
    { value: 'planning', label: 'Project Planning' },
    { value: 'research', label: 'Research & Analysis' },
    { value: 'training', label: 'Training & Learning' }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        
        if (onTimeUpdate) {
          onTimeUpdate(elapsed);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime, onTimeUpdate]);

  // Idle detection
  useEffect(() => {
    let idleTimer = null;
    
    const resetIdleTimer = () => {
      setLastActiveTime(Date.now());
      setIdleTime(0);
      clearTimeout(idleTimer);
      
      if (isRunning) {
        idleTimer = setTimeout(() => {
          setShowIdleModal(true);
        }, 300000); // 5 minutes
      }
    };

    const handleActivity = () => {
      resetIdleTimer();
    };

    if (isRunning) {
      document.addEventListener('mousedown', handleActivity);
      document.addEventListener('keydown', handleActivity);
      document.addEventListener('scroll', handleActivity);
      resetIdleTimer();
    }

    return () => {
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      clearTimeout(idleTimer);
    };
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      // Stop timer
      setIsRunning(false);
      setStartTime(null);
    } else {
      // Start timer
      setIsRunning(true);
      setStartTime(Date.now() - (elapsedTime * 1000));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    setShowIdleModal(false);
    setIdleTime(0);
  };

  const handleIdleResponse = (wasWorking) => {
    if (!wasWorking) {
      // Subtract idle time
      const idleSeconds = Math.floor((Date.now() - lastActiveTime) / 1000);
      setElapsedTime(prev => Math.max(0, prev - idleSeconds));
    }
    setShowIdleModal(false);
    setIdleTime(0);
  };

  const getProductivityStatus = () => {
    if (!isRunning) return { status: 'Stopped', color: 'text-muted-foreground', bg: 'bg-muted' };
    if (elapsedTime < 300) return { status: 'Starting', color: 'text-warning', bg: 'bg-warning/10' };
    if (elapsedTime < 1800) return { status: 'Focused', color: 'text-success', bg: 'bg-success/10' };
    return { status: 'Deep Work', color: 'text-primary', bg: 'bg-primary/10' };
  };

  const productivityStatus = getProductivityStatus();

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-8 card-shadow">
        <div className="text-center">
          {/* Timer Display */}
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-foreground mb-4">
              {formatTime(elapsedTime)}
            </div>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${productivityStatus?.bg}`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
              <span className={`text-sm font-medium ${productivityStatus?.color}`}>
                {productivityStatus?.status}
              </span>
            </div>
          </div>

          {/* Task Selection */}
          <div className="mb-8">
            <Select
              label="Current Task"
              options={taskOptions}
              value={currentTask}
              onChange={onTaskChange}
              placeholder="Select a task to track"
              className="max-w-md mx-auto"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="lg"
              onClick={handleStartStop}
              disabled={!currentTask}
              iconName={isRunning ? "Pause" : "Play"}
              iconPosition="left"
              className="px-8"
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reset
            </Button>
          </div>

          {/* Session Info */}
          {isRunning && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Session Started</p>
                  <p className="text-sm font-medium text-foreground">
                    {startTime ? new Date(startTime)?.toLocaleTimeString() : '--:--'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Productivity Score</p>
                  <p className="text-sm font-medium text-success">
                    {elapsedTime > 0 ? Math.min(100, Math.floor((elapsedTime / 3600) * 85)) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Break Reminder</p>
                  <p className="text-sm font-medium text-foreground">
                    {elapsedTime > 3600 ? 'Take a break!' : `${Math.max(0, 60 - Math.floor(elapsedTime / 60))} min`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Idle Detection Modal */}
      {showIdleModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 modal-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Clock" size={24} className="text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Idle Time Detected
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                We noticed you've been inactive for a while. Were you still working on your task?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleIdleResponse(false)}
                  className="flex-1"
                >
                  No, I was away
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleIdleResponse(true)}
                  className="flex-1"
                >
                  Yes, still working
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimerWidget;