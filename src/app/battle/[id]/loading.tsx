export default function BattleLoading() {
  return (
    <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-12 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between px-4 shrink-0">
         <div className="w-32 h-6 rounded bg-white/5 animate-pulse" />
         <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
      </div>

      <main className="flex-1 overflow-hidden grid grid-cols-[1fr_440px_350px] lg:grid-cols-[1fr_440px_350px]">
        {/* Editor Skeleton */}
        <div className="border-r border-white/5 bg-[#0a0a0c] p-4 space-y-4">
             <div className="h-full w-full bg-white/5 rounded animate-pulse opacity-50" />
        </div>

        {/* Middle / Preview Skeleton */}
        <div className="border-r border-white/5 bg-[#0a0a0c] p-4 flex flex-col gap-4">
             <div className="w-full h-64 bg-white/5 rounded animate-pulse" />
             <div className="w-full h-64 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Right / Info Skeleton */}
        <div className="bg-[#0a0a0c] p-4 space-y-6">
             <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
             <div className="space-y-2">
                 <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                 <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                 <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
             </div>
        </div>
      </main>
    </div>
  );
}
