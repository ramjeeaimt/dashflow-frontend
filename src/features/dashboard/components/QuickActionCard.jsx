import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ title, description, icon, color = "primary", onClick, badge }) => {
  const getColorConfig = (colorType) => {
    const configs = {
      primary: {
        iconColor: "text-blue-900",
        iconBg: "bg-blue-50",
        hoverBg: "hover:bg-slate-50",
        accent: "bg-blue-900"
      },
      success: {
        iconColor: "text-emerald-900",
        iconBg: "bg-emerald-50",
        hoverBg: "hover:bg-slate-50",
        accent: "bg-emerald-900"
      },
      warning: {
        iconColor: "text-amber-900",
        iconBg: "bg-amber-50",
        hoverBg: "hover:bg-slate-50",
        accent: "bg-amber-900"
      },
      error: {
        iconColor: "text-rose-900",
        iconBg: "bg-rose-50",
        hoverBg: "hover:bg-slate-50",
        accent: "bg-rose-900"
      }
    };
    return configs[colorType] || configs.primary;
  };

  const config = getColorConfig(color);

  return (
    <button
      onClick={onClick}
      className="group relative w-full p-6 bg-white border border-slate-900 transition-all duration-300 hover:shadow-[8px_8px_0px_rgba(15,23,42,0.1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none text-left overflow-hidden"
    >
      {/* Background decoration - industrial stripe */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rotate-45 -mr-8 -mt-8 transition-transform duration-500 group-hover:rotate-90"></div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 flex items-center justify-center border-2 border-slate-900 transition-all duration-500 group-hover:bg-slate-900 group-hover:text-white ${config.iconColor}`}>
            <Icon name={icon} size={20} strokeWidth={2.5} />
          </div>
          {badge && (
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_rgba(15,23,42,0.1)] ${config.accent}`}>
              {badge}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-1 ${config.accent}`}></span>
            <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">
              {title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight opacity-70">
            {description}
          </p>
        </div>

        <div className="pt-2 flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">
          <span>Initialize Protocol</span>
          <Icon name="ArrowRight" size={10} className="transition-transform group-hover:translate-x-1" strokeWidth={4} />
        </div>
      </div>

      {/* Industrial corner markers */}
      <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-slate-300"></div>
      <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-slate-300"></div>
    </button>
  );
};

export default QuickActionCard;