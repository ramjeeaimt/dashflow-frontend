import React from 'react';
import Icon from '../../../components/AppIcon';

// Quiet action tile — neutral icon chip, plain label, no decorative accents.
// `color` is accepted for API compatibility but intentionally unused.
const QuickActionCard = ({ title, description, icon, color = 'primary', onClick, badge }) => {
  return (
    <button
      onClick={onClick}
      className="group w-full p-5 bg-card border border-border rounded-lg text-left transition-colors hover:border-muted-foreground/40"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon name={icon} size={18} strokeWidth={2} />
        </div>
        {badge && (
          <span className="px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {title}
          <Icon
            name="ArrowRight"
            size={13}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            strokeWidth={2}
          />
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
};

export default QuickActionCard;
