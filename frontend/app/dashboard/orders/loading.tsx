import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-2 sm:mt-0">
                <Skeleton className="h-6 w-28" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
              <Skeleton className="h-5 w-24 mb-2 sm:mb-0" />
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Skeleton className="h-9 w-full sm:w-32" />
              <Skeleton className="h-9 w-full sm:w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
