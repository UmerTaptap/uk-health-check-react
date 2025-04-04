import { Skeleton } from "@/components/ui/skeleton";

export function GaugeChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-10" />
      </div>
      
      <div className="flex items-center justify-center py-6">
        {/* Circular gauge shape */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <div className="absolute inset-0">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="relative z-10">
            <Skeleton className="h-10 w-16 rounded-lg" />
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}