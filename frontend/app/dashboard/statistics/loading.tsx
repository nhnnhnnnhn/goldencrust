export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      <div className="h-96 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
