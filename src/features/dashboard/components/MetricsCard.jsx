import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, description, icon, color = "primary", onClick }) => {
  const getColorConfig = (colorType) => {
    const configs = {
      primary: {
        border: "border-blue-100",
        bg: "bg-blue-50/50",
        text: "text-blue-600",
        iconBg: "bg-blue-500",
        iconContainer: "bg-blue-100"
      },
      success: {
        border: "border-emerald-100",
        bg: "bg-emerald-50/50",
        text: "text-emerald-600",
        iconBg: "bg-emerald-500",
        iconContainer: "bg-emerald-100"
      },
      warning: {
        border: "border-amber-100",
        bg: "bg-amber-50/50",
        text: "text-amber-600",
        iconBg: "bg-amber-500",
        iconContainer: "bg-amber-100"
      },
      purple: {
        border: "border-purple-100",
        bg: "bg-purple-50/50",
        text: "text-purple-600",
        iconBg: "bg-purple-500",
        iconContainer: "bg-purple-100"
      }
    };
    return configs[colorType] || configs.primary;
  };

  const config = getColorConfig(color);

  return (
    <div 
      onClick={onClick}
      className={`relative p-6 ${config.bg} border ${config.border} rounded-none shadow-sm hover:shadow-md transition-all duration-300 h-full flex items-center justify-between ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="space-y-4">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${config.text} mb-2`}>
            {title}
          </p>
          <h3 className="text-4xl font-bold text-slate-800 tracking-tight leading-none mb-2">
            {value}
          </h3>
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            {description}
          </p>
        </div>
      </div>

      <div className={`w-14 h-14 ${config.iconContainer} rounded-none flex items-center justify-center text-white shadow-inner`}>
        <div className={`w-10 h-10 ${config.iconBg} rounded-none flex items-center justify-center shadow-lg transition-transform hover:scale-110`}>
          <Icon name={icon} size={22} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;