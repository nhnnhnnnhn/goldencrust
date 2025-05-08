export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200"></div>
      <div className="h-4 w-64 animate-pulse rounded-md bg-gray-200"></div>

      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div className="h-6 w-36 animate-pulse rounded-md bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"></div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div className="h-6 w-36 animate-pulse rounded-md bg-gray-200"></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200"></div>
            <div className="h-32 w-full animate-pulse rounded-md bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200"></div>
            <div className="h-32 w-full animate-pulse rounded-md bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    </div>
  )
}
