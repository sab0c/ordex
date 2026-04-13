"use client";

import { Card } from "@/components/ui/card";

function SkeletonLine({ className }: Readonly<{ className: string }>) {
  return <div className={`animate-pulse rounded-full bg-surface-elevated/60 ${className}`} />;
}

export function EditOrderFormSkeleton() {
  return (
    <Card className="space-y-6">
      <div className="space-y-3">
        <SkeletonLine className="h-8 w-48" />
        <SkeletonLine className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonLine className="h-14 w-full rounded-[1.6rem]" />
        <SkeletonLine className="h-14 w-full rounded-[1.6rem]" />
      </div>

      <SkeletonLine className="h-36 w-full rounded-[1.6rem]" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
        <SkeletonLine className="h-14 w-full rounded-[1.6rem]" />
        <SkeletonLine className="h-12 w-28 rounded-[1.6rem]" />
        <SkeletonLine className="h-12 w-36 rounded-[1.6rem]" />
      </div>
    </Card>
  );
}
