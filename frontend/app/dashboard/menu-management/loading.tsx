export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
