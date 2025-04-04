import { Skeleton } from "@/components/ui/skeleton";

export function AlertItemSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-3 w-3 rounded-full mt-1.5" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center justify-between mt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}