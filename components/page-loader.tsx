"use client"

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo/spinner */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-black-100/10" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-black-100 animate-spin" />
        </div>
        {/* Loading text */}
        <p className="text-sm text-black-100/60 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
