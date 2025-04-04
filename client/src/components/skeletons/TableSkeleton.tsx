import { Skeleton } from "@/components/ui/skeleton";

export interface TableSkeletonProps {
  columns: number;
  rows: number;
}

export function TableSkeleton({ columns = 4, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded-lg">
      {/* Table header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 grid" 
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-5 w-20" />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="p-4 border-b border-gray-200 last:border-0 grid items-center"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={`h-4 ${colIndex === 0 ? 'w-3/4' : 'w-2/3'}`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}