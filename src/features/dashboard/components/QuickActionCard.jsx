import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ title, description, icon, color = "primary", onClick, badge }) => {
  const getColorConfig = (colorType) => {
    const configs = {
      primary: {
        iconColor: "text-blue-600",
        iconBg: "bg-blue-500/10",
        hoverBg: "hover:border-blue-500/30",
        accent: "bg-blue-600"
      },
      success: {
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-500/10",
        hoverBg: "hover:border-emerald-500/30",
        accent: "bg-emerald-600"
      },
      warning: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-500/10",
        hoverBg: "hover:border-amber-500/30",
        accent: "bg-amber-600"
      },
      error: {
        iconColor: "text-rose-600",
        iconBg: "bg-rose-500/10",
        hoverBg: "hover:border-rose-500/30",
        accent: "bg-rose-600"
      }
    };
    return configs[colorType] || configs.primary;
  };

  const config = getColorConfig(color);

  return (
    <button
      onClick={onClick}
      className={`group relative w-full p-6 bg-white border border-slate-200/60 rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 text-left overflow-hidden ${config.hoverBg}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${config.iconBg} ${config.iconColor}`}>
            <Icon name={icon} size={28} strokeWidth={2.5} />
          </div>
          {badge && (
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white rounded-full shadow-lg shadow-blue-500/20 ${config.accent}`}>
              {badge}
            </span>
          )}
        </div>
        
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
            {title}
            <Icon name="ArrowRight" size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Subtle bottom progress-like line */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full ${config.iconColor}`} style={{ width: '0%', groupHover: { width: '100%' } }}></div>
    </button>
  );
};

export default QuickActionCard;