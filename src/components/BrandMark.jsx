import React from 'react';

/**
 * Dashflow brand mark — inline SVG so it renders crisply at any size and
 * inherits no external assets. `variant="dark"` for dark surfaces (sidebar),
 * `variant="light"` for light surfaces.
 */
export const BrandGlyph = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="14" fill="#191a17" />
    <path
      d="M20 16h13c9.4 0 17 7.2 17 16s-7.6 16-17 16H20V16zm9 7.5v17h4c5.5 0 9.5-3.7 9.5-8.5s-4-8.5-9.5-8.5h-4z"
      fill="#2eaf7d"
    />
  </svg>
);

const BrandMark = ({ variant = 'light', size = 'md', className = '' }) => {
  const glyph = size === 'sm' ? 22 : size === 'lg' ? 34 : 28;
  const text =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const color = variant === 'dark' ? 'text-sidebar-foreground' : 'text-foreground';

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
