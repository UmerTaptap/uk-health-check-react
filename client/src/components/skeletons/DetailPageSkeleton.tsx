import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "./CardSkeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={240} />
        <CardSkeleton lines={6} />
      </div>
      
      {/* Table */}
      <div className="mt-8">
        <div className="mb-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <TableSkeleton columns={5} rows={4} />
      </div>
    </div>
  );
}