/**
 * 骨架屏加载组件
 */
export function SkeletonCard() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 animate-pulse">
      <div className="h-6 bg-white/20 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-white/10 rounded w-1/4"></div>
        <div className="h-8 bg-white/10 rounded w-16"></div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/10 rounded"
          style={{ width: `${100 - i * 10}%` }}
        ></div>
      ))}
    </div>
  )
}
