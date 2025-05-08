import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-64" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-36" />
          <Skeleton className="h-10 w-full sm:w-36" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-2 sm:mt-0 flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
