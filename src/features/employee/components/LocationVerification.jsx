import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LocationVerification = ({ location, onRefreshLocation, workMode }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Mock office locations for verification
  const officeLocations = [
    {
      id: 1,
      name: 'Main Office',
      address: '4/37 KV House vibhaavkhand gomti nagar lucknow',
      latitude: 26.8611498,
      longitude: 81.0175873,
      radius: 250 // meters
    },
    {
      id: 2,
      name: 'main office',
      address: '4/37 KV House vibhaavkhand gomti nagar lucknow',
      latitude: 26.8611498,
      longitude: 81.0175873,
      radius: 350
    }
  ];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const getNearestOffice = () => {
    if (!location?.latitude || !location?.longitude) return null;

    let nearest = null;
    let minDistance = Infinity;

    officeLocations?.forEach(office => {
      const distance = calculateDistance(
        location?.latitude,
        location?.longitude,
        office?.latitude,
        office?.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...office, distance: Math.round(distance) };
      }
    });

    return nearest;
  };

  const nearestOffice = getNearestOffice();
  const isWithinOfficeRadius = nearestOffice && nearestOffice?.distance <= nearestOffice?.radius;

  const getLocationStatus = () => {
    if (workMode !== 'office') {
      return {
        status: 'not_required',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
        icon: 'Info',
        iconColor: 'text-blue-500',
        message: 'Location verification not required for this work mode'
      };
    }

    if (!location?.verified) {
      return {
        status: 'unverified',
        color: 'bg-error/10 border-error/20',
        textColor: 'text-error',
        icon: 'AlertTriangle',
        iconColor: 'text-error',
        message: 'Unable to verify location. Please enable GPS or enter manually.'
      };
    }

    if (isWithinOfficeRadius) {
      return {
        status: 'verified',
        color: 'bg-success/10 border-success/20',
        textColor: 'text-success',
        icon: 'CheckCircle',
        iconColor: 'text-success',
        message: `Verified at ${nearestOffice?.name} (${nearestOffice?.distance}m away)`
      };
    }

    return {
      status: 'outside_range',
      color: 'bg-warning/10 border-warning/20',
      textColor: 'text-warning',
      icon: 'AlertCircle',
      iconColor: 'text-warning',
      message: `Outside office range. Nearest: ${nearestOffice?.name} (${nearestOffice?.distance}m away)`
    };
  };

  const locationStatus = getLocationStatus();

  const handleManualLocationSubmit = () => {
    if (manualLocation?.trim()) {
      console.log('Manual location submitted:', manualLocation);
      setShowManualEntry(false);
      setManualLocation('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Location Verification</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshLocation}
          disabled={!navigator?.geolocation}
        >
          <Icon name="RefreshCw" size={14} className="mr-1" />
          Refresh
        </Button>
      </div>
      {/* Location Status */}
      <div className={`p-4 rounded-lg border ${locationStatus?.color} mb-4`}>
        <div className="flex items-start space-x-3">
          <Icon name={locationStatus?.icon} size={18} className={locationStatus?.iconColor} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Location Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${locationStatus?.color} ${locationStatus?.textColor}`}>
                {locationStatus?.status?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
            <p className={`text-sm ${locationStatus?.textColor}`}>
              {locationStatus?.message}
            </p>
          </div>
        </div>
      </div>
      {/* Current Location Details */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Current Location
          </label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="MapPin" size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{location?.address}</p>
                {location?.latitude && location?.longitude && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {location?.latitude?.toFixed(6)}, {location?.longitude?.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Work Mode Display */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Work Mode
          </label>
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Icon 
              name={workMode === 'office' ? 'Building' : workMode === 'wfh' ? 'Home' : 'MapPin'} 
              size={16} 
              className="text-primary" 
            />
            <span className="text-sm text-foreground capitalize">
              {workMode?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Office Locations (for reference) */}
        {workMode === 'office' && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Office Locations
            </label>
            <div className="space-y-2">
              {officeLocations?.map((office) => {
                const distance = location?.latitude && location?.longitude 
                  ? calculateDistance(
                      location?.latitude,
                      location?.longitude,
                      office?.latitude,
                      office?.longitude
                    )
                  : null;

                return (
                  <div key={office?.id} className={`p-3 rounded-lg border ${
                    distance && distance <= office?.radius 
                      ? 'bg-success/5 border-success/20' :'bg-muted/30 border-border'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{office?.name}</div>
                        <div className="text-xs text-muted-foreground">{office?.address}</div>
                      </div>
                      {distance && (
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            distance <= office?.radius ? 'text-success' : 'text-muted-foreground'
                          }`}>
                            {Math.round(distance)}m
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Range: {office?.radius}m
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Location Entry */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Manual Location Override
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualEntry(!showManualEntry)}
            >
              <Icon name="Edit" size={14} className="mr-1" />
              Override
            </Button>
          </div>

          {showManualEntry && (
            <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
              <div>
                <textarea
                  rows={2}
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e?.target?.value)}
                  placeholder="Enter your current location or reason for override..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualEntry(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleManualLocationSubmit}
                  disabled={!manualLocation?.trim()}
                >
                  Submit Override
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Location Permissions Help */}
        {!location?.verified && workMode === 'office' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Enable Location Access
                </p>
                <p className="text-xs text-blue-600">
                  To verify your office location, please allow location access in your browser settings or use manual override.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationVerification;