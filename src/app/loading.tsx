export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-white/5 rounded-full" />
        {/* Spinning Ring */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        {/* Inner Pulse */}
        <div className="absolute inset-0 m-auto w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
      </div>
      <p className="mt-4 text-zinc-500 font-mono text-sm animate-pulse tracking-widest uppercase">
        Loading System...
      </p>
    </div>
  );
}
