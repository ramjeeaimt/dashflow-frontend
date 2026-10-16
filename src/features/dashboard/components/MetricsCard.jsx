import React from 'react';
import Icon from '../../../components/AppIcon';

// Quiet stat tile: white surface, hairline border, muted label, tabular number.
// The `color` prop is kept for API compatibility but no longer floods the card —
// numbers and labels carry the hierarchy, not hues.
const TONE = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  purple: 'bg-accent text-primary',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
};

const MetricsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  color = 'primary', 
  onClick,
  cornerBadge,
  onCornerClick
}) => {
  const tone = TONE[color] || TONE.primary;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 bg-card border border-border rounded-xl card-shadow h-full flex items-start justify-between transition-colors ${
        onClick ? 'cursor-pointer hover:border-primary/30' : ''
      }`}
    >
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {title}
        </p>
        <h3 className="text-3xl font-semibold text-foreground tracking-tight leading-none mb-2 font-data">
          {value}
        </h3>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
          <Icon name={icon} size={18} strokeWidth={2} />
        </div>
        {cornerBadge && (
          <span
            onClick={(e) => {
              if (onCornerClick) {
                e.stopPropagation();
                onCornerClick(e);
              }
            }}
            className={`mt-3 text-[11px] font-medium text-muted-foreground bg-muted/70 px-2 py-0.5 rounded border border-border/50 transition-colors ${
              onCornerClick ? 'hover:bg-muted hover:text-foreground cursor-pointer' : ''
            }`}
            title="Former / Inactive employees: Click to view"
          >
            {cornerBadge}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;
