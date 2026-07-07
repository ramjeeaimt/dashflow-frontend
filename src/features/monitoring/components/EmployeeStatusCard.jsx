import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const EmployeeStatusCard = ({ employee }) => {
  const getWorkModeColor = (mode) => {
    switch (mode) {
      case 'WFH': return 'bg-primary/10 text-blue-800';
      case 'Office': return 'bg-green-100 text-green-800';
      case 'Client-site': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductivityColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Idle': return 'bg-yellow-500';
      case 'Away': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
              <Image
                src={employee?.avatar}
                alt={employee?.avatarAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(employee?.status)}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{employee?.name}</h3>
            <p className="text-sm text-muted-foreground">{employee?.department}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkModeColor(employee?.workMode)}`}>
          {employee?.workMode}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getProductivityColor(employee?.productivityScore)}`}>
            {employee?.productivityScore}%
          </div>
          <div className="text-xs text-muted-foreground">Productivity</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{employee?.hoursWorked}h</div>
          <div className="text-xs text-muted-foreground">Hours Today</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Activity:</span>
          <span className="text-foreground">{employee?.lastActivity}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Task:</span>
          <span className="text-foreground truncate ml-2">{employee?.currentTask}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <button className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors">
          <Icon name="Eye" size={16} />
          <span>View Details</span>
        </button>
        <div className="flex items-center space-x-2">
          {employee?.cameraEnabled && (
            <Icon name="Camera" size={16} className="text-green-600" />
          )}
          {employee?.screenMonitoring && (
            <Icon name="Monitor" size={16} className="text-primary" />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatusCard;