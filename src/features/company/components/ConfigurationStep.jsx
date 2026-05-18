import React from 'react';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ConfigurationStep = ({ formData, setFormData, errors, setErrors }) => {
  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
    { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
    { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST) - Phoenix' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKST) - Anchorage' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST) - Honolulu' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
    { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST) - Shanghai' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Mumbai' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST) - Sydney' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)', description: 'United States Dollar' },
    { value: 'EUR', label: 'Euro (€)', description: 'European Union Euro' },
    { value: 'GBP', label: 'British Pound (£)', description: 'British Pound Sterling' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', description: 'Canadian Dollar' },
    { value: 'AUD', label: 'Australian Dollar (A$)', description: 'Australian Dollar' },
    { value: 'JPY', label: 'Japanese Yen (¥)', description: 'Japanese Yen' },
    { value: 'CNY', label: 'Chinese Yuan (¥)', description: 'Chinese Yuan' },
    { value: 'INR', label: 'Indian Rupee (₹)', description: 'Indian Rupee' }
  ];

  const workingDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes a selection
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleWorkingDayChange = (dayId, checked) => {
    const updatedDays = checked 
      ? [...formData?.workingDays, dayId]
      : formData?.workingDays?.filter(day => day !== dayId);
    
    handleInputChange('workingDays', updatedDays);
  };

  const handleSelectAllWorkingDays = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    handleInputChange('workingDays', weekdays);
  };

  const handleClearAllWorkingDays = () => {
    handleInputChange('workingDays', []);
  };

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Workspace Configuration</h2>
        <p className="text-muted-foreground">
          Define your core operational standards. These foundation settings will shape how your enterprise manages time, capital, and resources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Time & Currency */}
          <div className="space-y-6">
            <Select
              label="Timezone"
              placeholder="Select your timezone"
              options={timezoneOptions}
              value={formData?.timezone}
              onChange={(value) => handleInputChange('timezone', value)}
              error={errors?.timezone}
              required
              searchable
              description="This will be used for all timestamps and scheduling"
            />

            <Select
              label="Primary Currency"
              placeholder="Select your currency"
              options={currencyOptions}
              value={formData?.currency}
              onChange={(value) => handleInputChange('currency', value)}
              error={errors?.currency}
              required
              searchable
              description="Used for payroll, expenses, and financial reporting"
            />

            {/* Date Format Preview */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Calendar" size={16} className="text-primary" />
                <h4 className="text-sm font-medium text-foreground">Date & Time Format Preview</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Date: {new Date()?.toLocaleDateString('en-US')}</p>
                <p>Time: {new Date()?.toLocaleTimeString('en-US', { 
                  timeZone: formData?.timezone || 'America/New_York',
                  hour12: true 
                })}</p>
                <p>Currency: {formData?.currency ? `${formData?.currency} 1,234.56` : 'USD 1,234.56'}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Working Days */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Working Days <span className="text-error">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-4">
                Select the days your company operates. This affects attendance tracking and scheduling.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Select Days:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectAllWorkingDays}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Weekdays
                    </button>
                    <span className="text-xs text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllWorkingDays}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {workingDays?.map((day) => (
                    <Checkbox
                      key={day?.id}
                      label={day?.label}
                      checked={formData?.workingDays?.includes(day?.id)}
                      onChange={(e) => handleWorkingDayChange(day?.id, e?.target?.checked)}
                    />
                  ))}
                </div>
              </div>
              
              {errors?.workingDays && (
                <p className="text-sm text-error mt-2">{errors?.workingDays}</p>
              )}
            </div>

            {/* Working Hours */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Clock" size={16} className="text-primary" />
                <h4 className="text-sm font-medium text-foreground">Default Working Hours</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Standard working hours can be customized per employee after setup.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData?.workStartTime}
                    onChange={(e) => handleInputChange('workStartTime', e?.target?.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData?.workEndTime}
                    onChange={(e) => handleInputChange('workEndTime', e?.target?.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Feature Preferences */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Feature Preferences</h4>
              <div className="space-y-3">
                <Checkbox
                  label="Enable Time Tracking"
                  description="Track employee work hours and productivity"
                  checked={formData?.enableTimeTracking}
                  onChange={(e) => handleInputChange('enableTimeTracking', e?.target?.checked)}
                />
                <Checkbox
                  label="Enable Screen Monitoring"
                  description="Monitor employee screens for remote work (requires consent)"
                  checked={formData?.enableScreenMonitoring}
                  onChange={(e) => handleInputChange('enableScreenMonitoring', e?.target?.checked)}
                />
                <Checkbox
                  label="Enable Payroll Module"
                  description="Manage salaries, deductions, and generate payslips"
                  checked={formData?.enablePayroll}
                  onChange={(e) => handleInputChange('enablePayroll', e?.target?.checked)}
                />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ConfigurationStep;