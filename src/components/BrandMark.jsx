import React from 'react';

/**
 * Dashflow brand mark — inline SVG so it renders crisply at any size and
 * inherits no external assets. `variant` only changes the wordmark color.
 */
export const BrandGlyph = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="18" fill="#6d5efc" />
    <rect x="13" y="14" width="17" height="16" rx="4.5" fill="#ffffff" />
    <rect x="34" y="14" width="17" height="10" rx="4.5" fill="#ffffff" fillOpacity="0.72" />
    <rect x="13" y="34" width="24" height="16" rx="4.5" fill="#ffffff" fillOpacity="0.9" />
    <rect x="41" y="34" width="10" height="16" rx="4.5" fill="#ffffff" />
  </svg>
);

const BrandMark = ({ variant = 'light', tone, size = 'md', className = '' }) => {
  const glyph = size === 'sm' ? 22 : size === 'lg' ? 34 : 28;
  const text =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const color = tone === 'inverse' || variant === 'inverse'
    ? 'text-white'
    : variant === 'dark'
      ? 'text-sidebar-foreground'
      : 'text-foreground';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandGlyph size={glyph} />
      <span className={`font-display font-semibold tracking-tight ${text} ${color}`}>
        Dashflow
      </span>
    </span>
  );
};

export default BrandMark;
