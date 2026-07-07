import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ExportPanel = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    {
      format: 'pdf',
      label: 'PDF Report',
      description: 'Executive summary with charts and insights',
      icon: 'FileText'
    },
    {
      format: 'excel',
      label: 'Excel Spreadsheet',
      description: 'Raw data with pivot tables and calculations',
      icon: 'Table'
    },
    {
      format: 'csv',
      label: 'CSV Data',
      description: 'Comma-separated values for data analysis',
      icon: 'Database'
    },
    {
      format: 'ppt',
      label: 'PowerPoint',
      description: 'Presentation slides with key metrics',
      icon: 'Presentation'
    }
  ];

  const handleExport = (format) => {
    onExport?.(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-150"
      >
        <Icon name="Download" size={16} />
        <span className="hidden sm:inline">Export</span>
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-sm z-50">
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-3">Export Analytics</h4>
            <div className="space-y-2">
              {exportOptions?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleExport(option?.format)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-150 text-left"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={option?.icon} size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{option?.label}</p>
                    <p className="text-xs text-muted-foreground">{option?.description}</p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Info" size={14} />
              <span>Reports include last 30 days of data by default</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportPanel;