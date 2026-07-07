import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Image from '../../../components/AppImage';

const ScreenshotMonitoring = () => {
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(10);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedScreenshots, setSelectedScreenshots] = useState([]);

  const mockScreenshots = [
  {
    id: 1,
    timestamp: '2025-10-19 10:30:15',
    task: 'Software Development',
    activityLevel: 92,
    image: "https://images.unsplash.com/photo-1724166551426-77aa7328d053",
    imageAlt: 'Computer screen showing code editor with JavaScript programming interface and multiple open files',
    blurred: false,
    flagged: false
  },
  {
    id: 2,
    timestamp: '2025-10-19 10:40:22',
    task: 'Software Development',
    activityLevel: 88,
    image: "https://images.unsplash.com/photo-1635181951411-882166210167",
    imageAlt: 'Desktop workspace with multiple browser windows open showing web development tools and documentation',
    blurred: false,
    flagged: false
  },
  {
    id: 3,
    timestamp: '2025-10-19 10:50:08',
    task: 'Team Meeting',
    activityLevel: 75,
    image: "https://images.unsplash.com/photo-1586543354240-2187898bb2e8",
    imageAlt: 'Video conference call interface showing multiple participants in a virtual team meeting',
    blurred: true,
    flagged: false
  },
  {
    id: 4,
    timestamp: '2025-10-19 11:00:45',
    task: 'Documentation',
    activityLevel: 65,
    image: "https://images.unsplash.com/photo-1587869133621-46739bf34b8a",
    imageAlt: 'Text editor application displaying technical documentation with markdown formatting and code snippets',
    blurred: false,
    flagged: true
  },
  {
    id: 5,
    timestamp: '2025-10-19 11:10:33',
    task: 'Code Review',
    activityLevel: 94,
    image: "https://images.unsplash.com/photo-1681511346350-6c665a364fa7",
    imageAlt: 'GitHub interface showing code diff comparison with highlighted changes and review comments',
    blurred: false,
    flagged: false
  },
  {
    id: 6,
    timestamp: '2025-10-19 11:20:17',
    task: 'Research & Analysis',
    activityLevel: 58,
    image: "https://images.unsplash.com/photo-1712904311048-dd345c13a7c2",
    imageAlt: 'Browser window with multiple tabs open showing research articles and data analysis charts',
    blurred: false,
    flagged: false
  }];


  const intervalOptions = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' }];


  const handleEnableMonitoring = () => {
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setIsMonitoringEnabled(true);
    setShowConsentModal(false);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
  };

  const handleDisableMonitoring = () => {
    setIsMonitoringEnabled(false);
  };

  const handleScreenshotSelect = (screenshotId) => {
    setSelectedScreenshots((prev) => {
      if (prev?.includes(screenshotId)) {
        return prev?.filter((id) => id !== screenshotId);
      }
      return [...prev, screenshotId];
    });
  };

  const handleBulkDelete = () => {
    if (selectedScreenshots?.length > 0) {
      // Handle bulk delete logic here
      setSelectedScreenshots([]);
    }
  };

  const getActivityColor = (level) => {
    if (level >= 80) return 'text-success bg-success/10';
    if (level >= 60) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const totalScreenshots = mockScreenshots?.length;
  const averageActivity = mockScreenshots?.reduce((sum, shot) => sum + shot?.activityLevel, 0) / totalScreenshots;
  const flaggedCount = mockScreenshots?.filter((shot) => shot?.flagged)?.length;

  return (
    <>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Screenshot Monitoring</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor work activity with periodic screen captures
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isMonitoringEnabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`
                }>
                  <div className={`w-2 h-2 rounded-full ${
                  isMonitoringEnabled ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`
                  }></div>
                  <span className="text-sm font-medium">
                    {isMonitoringEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              {isMonitoringEnabled ?
              <Button
                variant="destructive"
                onClick={handleDisableMonitoring}
                iconName="Square"
                iconPosition="left">

                  Stop Monitoring
                </Button> :

              <Button
                variant="default"
                onClick={handleEnableMonitoring}
                iconName="Play"
                iconPosition="left">

                  Start Monitoring
                </Button>
              }
            </div>
          </div>

          {/* Settings */}
          {isMonitoringEnabled &&
          <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Capture Interval
                  </label>
                  <select
                  value={captureInterval}
                  onChange={(e) => setCaptureInterval(Number(e?.target?.value))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">

                    {intervalOptions?.map((option) =>
                  <option key={option?.value} value={option?.value}>
                        {option?.label}
                      </option>
                  )}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Next Capture
                  </label>
                  <div className="px-3 py-2 bg-muted rounded-lg">
                    <span className="text-sm text-foreground">
                      {new Date(Date.now() + captureInterval * 60000)?.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Privacy Mode
                  </label>
                  <Checkbox
                  label="Blur sensitive content"
                  checked
                  onChange={() => {}} />

                </div>
              </div>
            </div>
          }
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 card-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Camera" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Screenshots</p>
                <p className="text-2xl font-bold text-foreground">{totalScreenshots}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 card-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="Activity" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Activity</p>
                <p className="text-2xl font-bold text-foreground">{averageActivity?.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 card-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Icon name="Flag" size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flagged Items</p>
                <p className="text-2xl font-bold text-foreground">{flaggedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Gallery */}
        <div className="bg-card border border-border rounded-lg card-shadow">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recent Screenshots</h3>
              <div className="flex items-center space-x-2">
                {selectedScreenshots?.length > 0 &&
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  iconName="Trash2"
                  iconPosition="left">

                    Delete ({selectedScreenshots?.length})
                  </Button>
                }
                <Button variant="outline" size="sm" iconName="Download">
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockScreenshots?.map((screenshot) =>
              <div key={screenshot?.id} className="group relative">
                  <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                    {/* Screenshot Image */}
                    <div className="relative aspect-video">
                      <Image
                      src={screenshot?.image}
                      alt={screenshot?.imageAlt}
                      className={`w-full h-full object-cover ${screenshot?.blurred ? 'blur-sm' : ''}`} />

                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
                        <div className="absolute top-2 left-2">
                          <Checkbox
                          checked={selectedScreenshots?.includes(screenshot?.id)}
                          onChange={() => handleScreenshotSelect(screenshot?.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity" />

                        </div>
                        
                        <div className="absolute top-2 right-2 flex space-x-1">
                          {screenshot?.flagged &&
                        <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                              <Icon name="Flag" size={12} className="text-white" />
                            </div>
                        }
                          {screenshot?.blurred &&
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Icon name="Eye" size={12} className="text-white" />
                            </div>
                        }
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {screenshot?.task}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActivityColor(screenshot?.activityLevel)}`}>
                          {screenshot?.activityLevel}%
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(screenshot.timestamp)?.toLocaleString()}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Button
                          variant="ghost"
                          size="sm"
                          iconName="Eye" />

                          <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download" />

                        </div>
                        
                        <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        className="text-destructive hover:text-destructive" />

                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-6">
              <Button variant="outline" iconName="ChevronDown">
                Load More Screenshots
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Consent Modal */}
      {showConsentModal &&
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 modal-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Enable Screenshot Monitoring
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                This feature will capture periodic screenshots of your screen for productivity monitoring. 
                Screenshots are encrypted and only accessible to authorized personnel. You can disable 
                this feature at any time.
              </p>
              
              <div className="space-y-3 mb-6">
                <Checkbox
                label="I understand that screenshots will be captured periodically"
                checked
                onChange={() => {}} />

                <Checkbox
                label="I consent to productivity monitoring for work purposes"
                checked
                onChange={() => {}} />

                <Checkbox
                label="I acknowledge that I can disable this feature anytime"
                checked
                onChange={() => {}} />

              </div>
              
              <div className="flex space-x-3">
                <Button
                variant="outline"
                onClick={handleConsentDecline}
                className="flex-1">

                  Decline
                </Button>
                <Button
                variant="default"
                onClick={handleConsentAccept}
                className="flex-1">

                  Accept & Enable
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    </>);

};

export default ScreenshotMonitoring;