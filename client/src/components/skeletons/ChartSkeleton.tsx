import { Skeleton } from "@/components/ui/skeleton";

export interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div className="w-full bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <Skeleton className="h-6 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
      
      <div className="flex justify-center mt-3 space-x-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}