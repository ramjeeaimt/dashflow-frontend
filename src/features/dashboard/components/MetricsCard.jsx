import React from 'react';
import Icon from '../../../components/AppIcon';

// Quiet stat tile: white surface, hairline border, muted label, tabular number.
// The `color` prop is kept for API compatibility but no longer floods the card —
// numbers and labels carry the hierarchy, not hues.
const MetricsCard = ({ title, value, description, icon, color = 'primary', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 bg-card border border-border rounded-lg h-full flex items-start justify-between transition-colors ${
 onClick ? 'cursor-pointer hover:border-muted-foreground/40' : ''
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

      <div className="w-9 h-9 bg-muted rounded-md flex items-center justify-center text-muted-foreground shrink-0">
        <Icon name={icon} size={18} strokeWidth={2} />
      </div>
    </div>
  );
};

export default MetricsCard;
