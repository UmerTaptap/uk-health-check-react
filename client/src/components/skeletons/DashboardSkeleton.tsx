import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { GaugeChartSkeleton } from "./GaugeChartSkeleton";
import { AlertItemSkeleton } from "./AlertItemSkeleton";
import { PropertyCardSkeleton } from "./PropertyCardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <Skeleton className="h-7 w-80 mb-2" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First column - Gauge charts */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GaugeChartSkeleton />
            <GaugeChartSkeleton />
            <GaugeChartSkeleton />
            <GaugeChartSkeleton />
          </div>
        </div>
        
        {/* Second column - Recent alerts */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <AlertItemSkeleton />
            <AlertItemSkeleton />
            <AlertItemSkeleton />
            <AlertItemSkeleton />
            <AlertItemSkeleton />
          </div>
        </div>
      </div>
      
      {/* Properties requiring attention */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      </div>
    </div>
  );
}