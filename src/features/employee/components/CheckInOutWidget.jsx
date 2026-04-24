import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import AppImage from '../../../components/AppImage';
import Button from '../../../components/ui/Button';


const CheckInOutWidget = ({
  attendanceStatus,
  location,
  onCheckIn,
  onCheckOut,
  employeeData
}) => {
  const [workMode, setWorkMode] = useState('office');
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const workModes = [
    {
      value: 'office',
      label: 'Office',
      icon: 'Building',
      description: 'Working from office location',
      color: 'text-primary'
    },
    {
      value: 'wfh',
      label: 'Work From Home',
      icon: 'Home',
      description: 'Remote work from home',
      color: 'text-blue-500'
    },
    {
      value: 'client_site',
      label: 'Client Site',
      icon: 'MapPin',
      description: 'Working at client location',
      color: 'text-orange-500'
    },
    {
      value: 'field_work',
      label: 'Field Work',
      icon: 'Truck',
      description: 'Mobile/field assignments',
      color: 'text-green-500'
    }
  ];

  const handleAction = () => {
    if (attendanceStatus?.isCheckedIn) {
      onCheckOut(notes);
    } else {
      onCheckIn(workMode, notes);
    }
    setNotes('');
  };

  const selectedMode = workModes?.find(mode => mode?.value === workMode);

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      {/* Employee Info Header */}
      <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-border">
        <AppImage
          src={employeeData?.profileImage}
          alt={employeeData?.alt}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">{employeeData?.name}</h2>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{employeeData?.employeeId}</span>
            <span>•</span>
            <span>{employeeData?.department}</span>
            <span>•</span>
            <span>{employeeData?.shift}</span>
          </div>
        </div>

        {attendanceStatus?.isCheckedIn && (
          <div className="text-right">
            <div className="text-2xl font-mono font-semibold text-success">
              {attendanceStatus?.currentSessionDuration}
            </div>
            <div className="text-sm text-muted-foreground">Current Session</div>
          </div>
        )}
      </div>
      {/* Status Display */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-medium ${attendanceStatus?.isCheckedIn
            ? 'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground border border-border'
          }`}>
          <Icon
            name={attendanceStatus?.isCheckedIn ? 'UserCheck' : 'UserX'}
            size={20}
          />
          <span>
            {attendanceStatus?.isCheckedIn ? 'Checked In' : 'Checked Out'}
          </span>
        </div>

        {attendanceStatus?.isCheckedIn && attendanceStatus?.checkInTime && (
          <p className="text-sm text-muted-foreground mt-2">
            Since {new Date(attendanceStatus?.checkInTime)?.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        )}
      </div>
      {/* Work Mode Selection (Only for Check-in) */}
      {!attendanceStatus?.isCheckedIn && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Work Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            {workModes?.map((mode) => (
              <button
                key={mode?.value}
                onClick={() => setWorkMode(mode?.value)}
                className={`p-4 rounded-lg border text-left transition-all duration-150 ${workMode === mode?.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card hover:bg-muted/50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={mode?.icon} size={20} className={mode?.color} />
                  <div>
                    <div className="font-medium text-foreground text-sm">{mode?.label}</div>
                    <div className="text-xs text-muted-foreground">{mode?.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Location Status */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon
              name="MapPin"
              size={16}
              className={location?.verified ? 'text-success' : 'text-warning'}
            />
            <span className="text-sm font-medium text-foreground">Location</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${location?.verified
              ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
            {location?.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{location?.address}</p>
      </div>
      {/* Notes */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e?.target?.value)}
          placeholder={attendanceStatus?.isCheckedIn
            ? "Add any notes about your work session..." : "Add any notes about your work location or schedule..."
          }
          className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAction}
          disabled={!location?.verified && workMode === 'office'}
          className={`w-full py-4 text-lg font-medium ${attendanceStatus?.isCheckedIn
              ? 'bg-error hover:bg-error/90 text-error-foreground'
              : 'bg-success hover:bg-success/90 text-success-foreground'
            }`}
        >
          <Icon
            name={attendanceStatus?.isCheckedIn ? 'LogOut' : 'LogIn'}
            size={20}
            className="mr-2"
          />
          {attendanceStatus?.isCheckedIn ? 'Check Out' : 'Check In'}
          {selectedMode && !attendanceStatus?.isCheckedIn && (
            <span className="ml-2 text-sm opacity-80">({selectedMode?.label})</span>
          )}
        </Button>

        {!location?.verified && workMode === 'office' && (
          <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <Icon name="AlertTriangle" size={16} className="text-warning flex-shrink-0" />
            <p className="text-sm text-warning">
              Location verification required for office check-in
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCamera(true)}
            className="flex items-center justify-center"
          >
            <Icon name="Camera" size={16} className="mr-1" />
            Take Photo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/task-management'}
            className="flex items-center justify-center"
          >
            <Icon name="CheckSquare" size={16} className="mr-1" />
            View Tasks
          </Button>
        </div>
      </div>
      {/* Break Status (when checked in) */}
      {attendanceStatus?.isCheckedIn && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className={`flex items-center justify-between p-4 rounded-lg ${attendanceStatus?.isOnBreak
              ? 'bg-warning/10 border border-warning/20' : 'bg-muted/50'
            }`}>
            <div className="flex items-center space-x-2">
              <Icon
                name="Coffee"
                size={16}
                className={attendanceStatus?.isOnBreak ? 'text-warning' : 'text-muted-foreground'}
              />
              <span className="text-sm font-medium text-foreground">
                {attendanceStatus?.isOnBreak ? 'On Break' : 'Working'}
              </span>
            </div>

            {attendanceStatus?.isOnBreak && (
              <span className="text-sm text-warning font-mono">
                Break Time: {attendanceStatus?.breakTime}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOutWidget;