import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, color = "primary" }) => {
  const getColorConfig = (colorType) => {
    const configs = {
      primary: {
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        border: "border-blue-500/20",
        iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
      },
      success: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600", 
        border: "border-emerald-500/20",
        iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20"
      }, 
      warning: {
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        border: "border-amber-500/20",
        iconBg: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20"
      },
      error: {
        bg: "bg-rose-500/10",
        text: "text-rose-600",
        border: "border-rose-500/20",
        iconBg: "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20"
      }
    };
    return configs[colorType] || configs.primary;
  };

  const config = getColorConfig(color);

  const getChangeColor = (type) => {
    if (type === 'positive') return 'text-emerald-600 bg-emerald-50';
    if (type === 'negative') return 'text-rose-600 bg-rose-50';
    return 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="group relative bg-white border border-slate-200/60  p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1.5 overflow-hidden">
      {/* Subtle background glow on hover */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-3xl ${config.bg}`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          </div>
          
          {change && (
            <div className={`flex items-center mt-4 w-fit px-3 py-1 rounded-xl border border-transparent transition-all duration-300 group-hover:border-current/10 ${getChangeColor(changeType)}`}>
              <Icon 
                name={changeType === 'positive' ? 'TrendingUp' : changeType === 'negative' ? 'TrendingDown' : 'Minus'} 
                size={14} 
                className="mr-1.5"
                strokeWidth={3}
              />
              <span className="text-xs font-black">
                {change}
              </span>
              <span className="text-[10px] ml-1.5 opacity-70 font-bold uppercase tracking-tighter">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${config.iconBg}`}>
          <Icon name={icon} size={28} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;