import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ScreenshotGallery = ({ employee }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  const screenshots = [
  {
    id: 1,
    timestamp: "2:45 PM",
    url: "https://images.unsplash.com/photo-1723987251277-18fc0a1effd0",
    alt: "Computer screen showing spreadsheet application with data analysis charts and graphs",
    activity: "Excel - Data Analysis",
    productivity: 92
  },
  {
    id: 2,
    timestamp: "2:30 PM",
    url: "https://images.unsplash.com/photo-1500743158760-95240730a978",
    alt: "Desktop screen displaying code editor with multiple programming files and terminal window",
    activity: "VS Code - Development",
    productivity: 88
  },
  {
    id: 3,
    timestamp: "2:15 PM",
    url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3",
    alt: "Browser window showing business dashboard with analytics charts and performance metrics",
    activity: "Dashboard Review",
    productivity: 85
  },
  {
    id: 4,
    timestamp: "2:00 PM",
    url: "https://images.unsplash.com/photo-1586543354240-2187898bb2e8",
    alt: "Video conference application showing team meeting with multiple participants on screen",
    activity: "Team Meeting",
    productivity: 95
  }];


  const getProductivityColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Camera" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Screenshot Gallery</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Employee: {employee?.name}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {screenshots?.map((screenshot, index) =>
        <div
          key={screenshot?.id || `screenshot-${index}`}
          className="relative group cursor-pointer"
          onClick={() => setSelectedScreenshot(screenshot)}>

            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <Image
              src={screenshot?.url}
              alt={screenshot?.alt}
              className="w-full h-full object-cover transition-transform duration-200" />

            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg flex items-center justify-center">
              <Icon name="ZoomIn" size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                {screenshot?.timestamp}
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <div className={`bg-white/90 text-xs px-2 py-1 rounded font-medium ${getProductivityColor(screenshot?.productivity)}`}>
                {screenshot?.productivity}%
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Capture Interval: 15 minutes</span>
          <span>•</span>
          <span>Privacy Mode: Enabled</span>
        </div>
        <button className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors">
          <Icon name="Settings" size={16} />
          <span>Configure</span>
        </button>
      </div>
      {/* Screenshot Modal */}
      {selectedScreenshot &&
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h4 className="font-semibold text-foreground">{selectedScreenshot?.activity}</h4>
                <p className="text-sm text-muted-foreground">Captured at {selectedScreenshot?.timestamp}</p>
              </div>
              <button
              onClick={() => setSelectedScreenshot(null)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                src={selectedScreenshot?.url}
                alt={selectedScreenshot?.alt}
                className="w-full h-full object-cover" />

              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Activity: {selectedScreenshot?.activity}</span>
                  <span className={`text-sm font-medium ${getProductivityColor(selectedScreenshot?.productivity)}`}>
                    Productivity: {selectedScreenshot?.productivity}%
                  </span>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Icon name="Download" size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ScreenshotGallery;