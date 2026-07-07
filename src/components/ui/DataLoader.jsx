import React from 'react';
import Icon from '../AppIcon';

const DataLoader = ({ 
  message = "Loading data...", 
  subMessage = "Please wait a moment",
  icon = "Loader2",
  size = "large",
  className = "" 
}) => {
  const sizeClasses = {
    small: "h-32",
    medium: "h-64",
    large: "h-96"
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full ${sizeClasses[size] || sizeClasses.large} animate-in fade-in duration-500 ${className}`}>
      <div className="relative mb-6">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        
        {/* Main spinning icon */}
        <div className="relative bg-card p-4 rounded-lg border border-blue-50 shadow-sm">
          <Icon 
            name={icon} 
            size={size === 'small' ? 24 : 40} 
            className="text-primary animate-spin" 
            strokeWidth={1.5}
          />
        </div>
        
        {/* Orbiting dot 1 */}
        <div className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        {/* Orbiting dot 2 */}
        <div className="absolute bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{message}</h3>
        {subMessage && (
          <p className="text-sm text-gray-400 mt-1 font-medium">{subMessage}</p>
        )}
      </div>
      
      {/* Progress line indicator */}
      <div className="w-32 h-1 bg-gray-100 rounded-full mt-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full bg-primary rounded-full w-1/3 animate-progress-slide"></div>
      </div>

      <style jsx>{`
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-progress-slide {
          animation: progress-slide 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DataLoader;
