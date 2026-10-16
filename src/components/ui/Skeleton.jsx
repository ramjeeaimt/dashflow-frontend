import React from 'react';
import BrandMark from '../BrandMark';

export const Bone = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-md ${className}`} />
);

export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="flex gap-4 px-5 py-3 border-b border-border bg-muted/40">
      {Array.from({ length: cols }).map((_, i) => (
        <Bone key={i} className="h-3 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          <Bone className="h-8 w-8 rounded-full shrink-0" />
          {Array.from({ length: cols }).map((__, c) => (
            <Bone key={c} className={`h-3.5 flex-1 ${c === cols - 1 ? 'max-w-[72px]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export function SkeletonRows({ rows = 6, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-3 sm:px-6 py-4">
              <Bone className={`h-3.5 ${c === 0 ? 'w-36' : 'w-20'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export const CardGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-5 h-[124px]">
        <Bone className="h-3 w-24 mb-4" />
        <Bone className="h-8 w-16 mb-3" />
        <Bone className="h-3 w-28" />
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-6 space-y-5">
    <Bone className="h-5 w-40" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-3 w-20" />
          <Bone className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
    <Bone className="h-10 w-28 rounded-lg" />
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
      <Bone className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Bone className="h-5 w-48" />
        <Bone className="h-3 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const PageSkeleton = ({ variant = 'table' }) => {
  if (variant === 'form') return <FormSkeleton />;
  if (variant === 'detail') return <DetailSkeleton />;
  if (variant === 'cards') return <CardGridSkeleton />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Bone className="h-6 w-40" />
          <Bone className="h-3 w-64" />
        </div>
        <Bone className="h-9 w-28 rounded-lg" />
      </div>
      <TableSkeleton />
    </div>
  );
};

export const BootScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
    <BrandMark />
    <div className="w-40 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className="h-full w-1/3 skeleton-shimmer rounded-full" />
    </div>
  </div>
);

export default PageSkeleton;
