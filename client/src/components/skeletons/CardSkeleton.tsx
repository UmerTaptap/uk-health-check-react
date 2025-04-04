import { Skeleton } from "@/components/ui/skeleton";

export interface CardSkeletonProps {
  hasHeader?: boolean;
  hasFooter?: boolean;
  lines?: number;
}

export function CardSkeleton({ hasHeader = true, hasFooter = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {hasHeader && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      )}
      
      <div className="p-5 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={`line-${i}`} 
            className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
          />
        ))}
      </div>
      
      {hasFooter && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      )}
    </div>
  );
}