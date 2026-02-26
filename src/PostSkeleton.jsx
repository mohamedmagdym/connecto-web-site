export default function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4 overflow-hidden relative">
      {/* Shimmer Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/40 to-transparent"></div>

      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>

        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 relative z-10">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Image Placeholder (واقعي مش دايمًا موجود) */}
      {Math.random() > 0.4 && (
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded-xl relative z-10"></div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2 relative z-10">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
}
