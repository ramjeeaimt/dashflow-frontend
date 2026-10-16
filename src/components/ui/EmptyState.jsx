import React from 'react';
import Icon from '../AppIcon';

const EmptyState = ({
  icon = 'Inbox',
  title = 'Nothing here yet',
  description = 'Records will show up here once they exist.',
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="w-12 h-12 rounded-xl bg-accent text-primary flex items-center justify-center mb-4">
      <Icon name={icon} size={22} />
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
