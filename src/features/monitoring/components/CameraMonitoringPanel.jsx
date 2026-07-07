import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CameraMonitoringPanel = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const cameraData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    department: 'Engineering',
    avatar: "https://images.unsplash.com/photo-1684262855358-88f296a2cfc2",
    avatarAlt: 'Professional headshot of woman with brown hair in white blazer smiling at camera',
    consentStatus: 'Granted',
    lastCapture: '2:45 PM',
    workMode: 'WFH',
    cameraEnabled: true,
    complianceScore: 95,
    captures: [
    {
      id: 1,
      timestamp: '2:45 PM',
      url: "https://images.unsplash.com/photo-1433293440557-41acb29e723c",
      alt: 'Professional woman working at home office desk with laptop and documents',
      verified: true
    },
    {
      id: 2,
      timestamp: '2:30 PM',
      url: "https://images.unsplash.com/photo-1547673516-a94ece1efe0c",
      alt: 'Woman in casual attire focused on computer screen in home workspace',
      verified: true
    }]

  },
  {
    id: 2,
    name: 'Michael Chen',
    department: 'Marketing',
    avatar: "https://images.unsplash.com/photo-1687256457585-3608dfa736c5",
    avatarAlt: 'Professional headshot of Asian man with short black hair in navy suit',
    consentStatus: 'Granted',
    lastCapture: '2:42 PM',
    workMode: 'WFH',
    cameraEnabled: true,
    complianceScore: 88,
    captures: [
    {
      id: 1,
      timestamp: '2:42 PM',
      url: "https://images.unsplash.com/photo-1730210730648-4c0618bb3e11",
      alt: 'Professional man in casual shirt working on laptop in modern home office',
      verified: true
    }]

  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    department: 'Design',
    avatar: "https://images.unsplash.com/photo-1654110951517-0307aed76b75",
    avatarAlt: 'Professional headshot of Hispanic woman with long dark hair in black top',
    consentStatus: 'Pending',
    lastCapture: 'N/A',
    workMode: 'WFH',
    cameraEnabled: false,
    complianceScore: 0,
    captures: []
  }];


  const getConsentColor = (status) => {
    switch (status) {
      case 'Granted':return 'bg-green-100 text-green-800';
      case 'Pending':return 'bg-yellow-100 text-yellow-800';
      case 'Denied':return 'bg-red-100 text-red-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Camera" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Camera Monitoring</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Settings"
            iconPosition="left">

            Configure
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Shield"
            iconPosition="left">

            Privacy Settings
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <h4 className="text-sm font-medium text-foreground mb-3">WFH Employees</h4>
          <div className="space-y-3">
            {cameraData?.map((employee) =>
            <div
              key={employee?.id}
              className={`p-3 border border-border rounded-lg cursor-pointer transition-colors ${
              selectedEmployee?.id === employee?.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`
              }
              onClick={() => setSelectedEmployee(employee)}>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                      src={employee?.avatar}
                      alt={employee?.avatarAlt}
                      className="w-full h-full object-cover" />

                    </div>
                    {employee?.cameraEnabled &&
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
                  }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{employee?.name}</p>
                    <p className="text-xs text-muted-foreground">{employee?.department}</p>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConsentColor(employee?.consentStatus)}`}>
                    {employee?.consentStatus}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Camera" size={12} className={employee?.cameraEnabled ? 'text-green-600' : 'text-gray-400'} />
                    <span className="text-xs text-muted-foreground">{employee?.lastCapture}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camera Feed/Details */}
        <div className="lg:col-span-2">
          {selectedEmployee ?
          <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-foreground">{selectedEmployee?.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedEmployee?.department} • {selectedEmployee?.workMode}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getComplianceColor(selectedEmployee?.complianceScore)}`}>
                      {selectedEmployee?.complianceScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Compliance</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${selectedEmployee?.cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>

              {selectedEmployee?.cameraEnabled ?
            <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {selectedEmployee?.captures?.map((capture) =>
                <div key={capture?.id} className="relative">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <Image
                      src={capture?.url}
                      alt={capture?.alt}
                      className="w-full h-full object-cover" />

                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {capture?.timestamp}
                          </div>
                          {capture?.verified &&
                    <div className="bg-green-500 text-white p-1 rounded">
                              <Icon name="Check" size={12} />
                            </div>
                    }
                        </div>
                      </div>
                )}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">Capture Interval:</span>
                        <span className="text-foreground font-medium">15 minutes</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">Privacy Mode:</span>
                        <span className="text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div> :

            <div className="text-center py-12">
                  <Icon name="CameraOff" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h5 className="text-lg font-medium text-foreground mb-2">Camera Monitoring Disabled</h5>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedEmployee?.consentStatus === 'Pending' ? 'Waiting for employee consent to enable camera monitoring.' : 'Employee has not granted camera monitoring consent.'
                }
                  </p>
                  <Button variant="outline" size="sm">
                    Send Consent Request
                  </Button>
                </div>
            }
            </div> :

          <div className="text-center py-12">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h5 className="text-lg font-medium text-foreground mb-2">Select an Employee</h5>
              <p className="text-sm text-muted-foreground">
                Choose an employee from the list to view their camera monitoring details.
              </p>
            </div>
          }
        </div>
      </div>
      {/* Privacy Notice */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-start space-x-3 p-4 bg-primary/10 border border-border rounded-lg">
          <Icon name="Shield" size={20} className="text-primary mt-0.5" />
          <div>
            <h6 className="text-sm font-medium text-blue-900 mb-1">Privacy & Compliance Notice</h6>
            <p className="text-xs text-primary">
              Camera monitoring is conducted with explicit employee consent and follows data protection regulations. 
              All captures are encrypted and automatically deleted after 30 days unless flagged for review.
            </p>
          </div>
        </div>
      </div>
    </div>);

};

export default CameraMonitoringPanel;