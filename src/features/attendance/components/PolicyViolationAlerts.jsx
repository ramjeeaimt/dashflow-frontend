import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PolicyViolationAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'frequent_late',
      severity: 'warning',
      employeeName: 'Michael Chen',
      employeeId: 'EMP002',
      message: 'Has been late 4 times this week (Policy: Max 2 late arrivals per week)',
      timestamp: '2 hours ago',
      action_required: true,
      rule: 'Late Arrival Policy'
    },
    {
      id: 2,
      type: 'consecutive_absences',
      severity: 'high',
      employeeName: 'Jennifer Smith',
      employeeId: 'EMP015',
      message: 'Absent for 3 consecutive days without prior approval',
      timestamp: '4 hours ago',
      action_required: true,
      rule: 'Consecutive Absence Policy'
    },
    {
      id: 3,
      type: 'overtime_violation',
      severity: 'medium',
      employeeName: 'Alex Rodriguez',
      employeeId: 'EMP008',
      message: 'Exceeded weekly overtime limit (45 hours worked, limit: 40 hours)',
      timestamp: '1 day ago',
      action_required: false,
      rule: 'Overtime Policy'
    },
    {
      id: 4,
      type: 'early_departure',
      severity: 'low',
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP001',
      message: 'Left early 3 times this month without manager approval',
      timestamp: '2 days ago',
      action_required: false,
      rule: 'Early Departure Policy'
    }
  ]);

  const [showAll, setShowAll] = useState(false);

  const getSeverityConfig = (severity) => {
    const configs = {
      high: { 
        color: 'bg-error/10 border-error/20 text-error', 
        icon: 'AlertTriangle', 
        iconColor: 'text-error',
        label: 'High Priority'
      },
      warning: { 
        color: 'bg-warning/10 border-warning/20 text-warning', 
        icon: 'AlertCircle', 
        iconColor: 'text-warning',
        label: 'Warning'
      },
      medium: { 
        color: 'bg-orange-50 border-orange-200 text-orange-600', 
        icon: 'Info', 
        iconColor: 'text-orange-500',
        label: 'Medium Priority'
      },
      low: { 
        color: 'bg-primary/10 border-border text-primary', 
        icon: 'AlertCircle', 
        iconColor: 'text-primary',
        label: 'Low Priority'
      }
    };
    return configs?.[severity] || configs?.medium;
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(alerts?.filter(alert => alert?.id !== alertId));
  };

  const handleTakeAction = (alert) => {
    console.log('Taking action for:', alert);
    // Implement action logic
  };

  const displayedAlerts = showAll ? alerts : alerts?.slice(0, 2);
  const hasMoreAlerts = alerts?.length > 2;

  if (alerts?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} className="text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Policy Violation Alerts</h3>
          {alerts?.filter(alert => alert?.action_required)?.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
              {alerts?.filter(alert => alert?.action_required)?.length} Need Action
            </span>
          )}
        </div>
        
        {hasMoreAlerts && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${alerts?.length})`}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {displayedAlerts?.map((alert) => {
          const severityConfig = getSeverityConfig(alert?.severity);
          
          return (
            <div
              key={alert?.id}
              className={`border rounded-lg p-4 ${severityConfig?.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon 
                    name={severityConfig?.icon} 
                    size={18} 
                    className={severityConfig?.iconColor}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">
                        {alert?.employeeName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({alert?.employeeId})
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityConfig?.color}`}>
                        {severityConfig?.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">
                      {alert?.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Icon name="Clock" size={12} />
                        <span>{alert?.timestamp}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="FileText" size={12} />
                        <span>{alert?.rule}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {alert?.action_required && (
                    <Button
                      size="sm"
                      onClick={() => handleTakeAction(alert)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Take Action
                    </Button>
                  )}
                  
                  <button
                    onClick={() => handleDismissAlert(alert?.id)}
                    className="p-1 hover:bg-muted rounded transition-colors duration-150"
                    title="Dismiss Alert"
                  >
                    <Icon name="X" size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alerts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="mx-auto text-success mb-3" />
          <h4 className="text-lg font-medium text-foreground mb-2">All Clear!</h4>
          <p className="text-muted-foreground">No policy violations detected.</p>
        </div>
      )}
    </div>
  );
};

export default PolicyViolationAlerts;