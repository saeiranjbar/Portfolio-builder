'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Animated shimmer skeleton block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded-xl',
        className
      )}
    />
  );
}


/** Full page loading skeleton for the portfolio preview */
export function PortfolioSkeleton() {
  return (
    <div className="w-full space-y-8 p-8">
      {/* Hero skeleton */}
      <div className="flex flex-col items-center gap-4 py-20">
        <Skeleton className="w-32 h-32 rounded-full" />
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-96 h-4" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
      </div>

      {/* Projects skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-48 h-6 mx-auto" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* About skeleton */}
      <div className="flex gap-8">
        <Skeleton className="w-1/3 h-64" />
        <div className="flex-1 space-y-3">
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      </div>

      {/* Contact skeleton */}
      <div className="space-y-4 py-8">
        <Skeleton className="w-48 h-6 mx-auto" />
        <Skeleton className="w-full max-w-md h-10 mx-auto" />
        <Skeleton className="w-full max-w-md h-10 mx-auto" />
        <Skeleton className="w-full max-w-md h-24 mx-auto" />
        <Skeleton className="w-full max-w-md h-10 mx-auto" />
      </div>
    </div>
  );
}

/** Project card skeleton for lazy loading states */
export function ProjectCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full h-48" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-3" />
    </div>
  );
}
