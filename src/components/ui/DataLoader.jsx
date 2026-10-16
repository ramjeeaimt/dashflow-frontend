import React from 'react';
import { PageSkeleton } from './Skeleton';

const DataLoader = ({
  message = 'Loading data...',
  subMessage,
  size = 'large',
  className = '',
}) => {
  const variant = size === 'small' ? 'cards' : 'table';

  return (
    <div className={`w-full animate-in fade-in duration-300 ${className}`} role="status" aria-live="polite">
      <PageSkeleton variant={variant} />
      <p className="sr-only">{message}{subMessage ? `. ${subMessage}` : ''}</p>
    </div>
  );
};

export default DataLoader;
