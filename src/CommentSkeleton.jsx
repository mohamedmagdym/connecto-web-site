export default function CommentSkeleton() {
  return (
    <div className="bg-white/95 p-4 rounded-2xl shadow-sm space-y-3 overflow-hidden relative">
      {/* Shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-100 rounded w-40" />
          </div>
        </div>

        <div className="space-y-2 text-right">
          <div className="h-3 bg-gray-100 rounded w-14" />
          <div className="h-3 bg-gray-100 rounded w-14" />
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-3/6" />
      </div>

      <div className="flex gap-2 relative z-10">
        <div className="h-8 bg-gray-100 rounded-xl w-20" />
        <div className="h-8 bg-gray-100 rounded-xl w-20" />
      </div>
    </div>
  );
}
