import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, color = "primary" }) => {
  const getColorConfig = (colorType) => {
    const configs = {
      primary: {
        border: "border-blue-900",
        bg: "bg-blue-50",
        text: "text-blue-900",
        iconBg: "bg-blue-900",
        accent: "bg-blue-600"
      },
      success: {
        border: "border-emerald-900",
        bg: "bg-emerald-50",
        text: "text-emerald-900",
        iconBg: "bg-emerald-900",
        accent: "bg-emerald-600"
      },
      warning: {
        border: "border-amber-900",
        bg: "bg-amber-50",
        text: "text-amber-900",
        iconBg: "bg-amber-900",
        accent: "bg-amber-600"
      },
      error: {
        border: "border-rose-900",
        bg: "bg-rose-50",
        text: "text-rose-900",
        iconBg: "bg-rose-900",
        accent: "bg-rose-600"
      }
    };
    return configs[colorType] || configs.primary;
  };

  const config = getColorConfig(color);

  const getChangeTheme = (type) => {
    if (type === 'positive') return 'bg-emerald-900 text-white';
    if (type === 'negative') return 'bg-rose-900 text-white';
    return 'bg-slate-900 text-white';
  };

  return (
    <div className="group relative bg-white p-6 transition-all duration-300 hover:bg-slate-50 overflow-hidden h-full">
      {/* Precision grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
      
      <div className="flex flex-col relative z-10 h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <span className={`inline-block w-4 h-1 ${config.accent}`}></span>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-1">{title}</p>
          </div>
          <div className={`w-12 h-12 rounded-none flex items-center justify-center text-white transition-all duration-500 group-hover:bg-slate-700 ${config.iconBg}`}>
            <Icon name={icon} size={20} strokeWidth={2.5} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter font-mono leading-none">{value}</h3>
          
          {change && (
            <div className="flex items-center space-x-2">
              <div className={`flex items-center px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${getChangeTheme(changeType)}`}>
                <Icon 
                  name={changeType === 'positive' ? 'TrendingUp' : changeType === 'negative' ? 'TrendingDown' : 'Minus'} 
                  size={10} 
                  className="mr-1"
                  strokeWidth={4}
                />
                <span>{change}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">vs static_baseline</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Right border indicator */}
      <div className={`absolute top-0 right-0 w-1 h-0 group-hover:h-full transition-all duration-500 ${config.accent}`}></div>
    </div>
  );
};

export default MetricsCard;