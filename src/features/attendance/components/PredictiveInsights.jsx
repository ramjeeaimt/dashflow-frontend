import React from 'react';
import Icon from '../../../components/AppIcon';

const PredictiveInsights = () => {
  const insights = [
    {
      type: 'forecast',
      title: 'Attendance Forecast',
      description: 'Expected 3% increase in attendance next month based on seasonal trends',
      confidence: 85,
      icon: 'TrendingUp',
      color: 'success'
    },
    {
      type: 'risk',
      title: 'Risk Alert',
      description: '7 employees showing declining attendance patterns - intervention recommended',
      confidence: 92,
      icon: 'AlertTriangle',
      color: 'warning'
    },
    {
      type: 'optimization',
      title: 'Optimization Opportunity',
      description: 'Flexible work arrangements could improve punctuality by 8%',
      confidence: 78,
      icon: 'Lightbulb',
      color: 'primary'
    },
    {
      type: 'seasonal',
      title: 'Seasonal Pattern',
      description: 'Holiday season typically shows 15% decrease in attendance',
      confidence: 94,
      icon: 'Calendar',
      color: 'error'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      success: 'text-success bg-success/10 border-success/20',
      warning: 'text-warning bg-warning/10 border-warning/20',
      primary: 'text-primary bg-primary/10 border-primary/20',
      error: 'text-error bg-error/10 border-error/20'
    };
    return colors?.[color] || colors?.primary;
  };

  const getIconBgColor = (color) => {
    const colors = {
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      primary: 'bg-primary text-primary-foreground',
      error: 'bg-error text-error-foreground'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Brain" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Predictive Insights</h3>
      </div>

      <div className="space-y-4">
        {insights?.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getColorClasses(insight?.color)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgColor(insight?.color)}`}>
                <Icon name={insight?.icon} size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground text-sm">{insight?.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {insight?.confidence}% confidence
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {insight?.description}
                </p>
                
                {/* Confidence Bar */}
                <div className="w-full bg-muted/50 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
 insight?.color === 'success' ? 'bg-success' :
 insight?.color === 'warning' ? 'bg-warning' :
 insight?.color === 'error' ? 'bg-error' : 'bg-primary'
 }`}
                    style={{ width: `${insight?.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-border">
        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-150">
          <Icon name="Download" size={16} />
          <span className="text-sm">Export Insights</span>
        </button>
        
        <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors duration-150">
          <Icon name="Settings" size={16} />
          <span className="text-sm">Configure Alerts</span>
        </button>
      </div>
    </div>
  );
};

export default PredictiveInsights;