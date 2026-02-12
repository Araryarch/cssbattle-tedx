import { useState, useRef } from "react";
import { Zap, Clock, Hash, History, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChallengeStats } from "@/lib/hooks/useBattle";
import { ScoreResult } from "@/lib/scoring";
import Link from "next/link";

interface BattleMiddleProps {
  challengeId: string;
  previewDoc: string;
  targetCode?: string;
  stats: ChallengeStats | null;
  lastScore: ScoreResult | null;
  userStats: { 
      best: { score: number; accuracy: number; chars: number; duration: number } | null;
      latest: { score: number; accuracy: number; chars: number; duration: number } | null;
  } | null;
  showTarget: boolean;
}

export default function BattleMiddle({
  challengeId,
  previewDoc,
  targetCode,
  stats,
  lastScore,
  userStats,
}: BattleMiddleProps) {
  const [activeTab, setActiveTab] = useState<"your" | "global">("your");
  const [slideEnabled, setSlideEnabled] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [showDiff, setShowDiff] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const targetSrcDoc = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${targetCode || ""}</body></html>`;

  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!slideEnabled || !isHovering || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderValue(percent);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (slideEnabled) {
      document.body.style.cursor = 'col-resize';
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    document.body.style.cursor = '';
  };

  return (
    <div className="flex flex-col bg-[#0a0a0c] h-full relative">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0c]">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Code Output
        </span>
        <div className="flex items-center gap-4">
          <Link 
            href={`/battle/${challengeId}/solutions`}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors group"
            target="_blank"
          >
             <Target className="w-3 h-3 group-hover:text-primary transition-colors" /> Solutions
          </Link>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={slideEnabled}
              onChange={(e) => {
                  setSlideEnabled(e.target.checked);
              }}
              className="accent-primary w-3 h-3 cursor-pointer"
            />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", slideEnabled ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>
              Slide & Compare
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showDiff}
              onChange={(e) => setShowDiff(e.target.checked)}
              className="accent-primary w-3 h-3 cursor-pointer"
            />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", showDiff ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>
              Diff
            </span>
          </label>
        </div>
      </div>

      {/* Output Area — simple responsive 4:3 box like BattleRight */}
      <div className="p-4 bg-[#0a0a0c] flex items-center justify-center">
        <div 
            ref={containerRef}
            className="w-[400px] aspect-[4/3] bg-white rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 relative select-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Target - Shown underneath for Diff mode - Monochrome */}
            <iframe
                title="target-output"
                srcDoc={targetSrcDoc}
                className="w-full h-full border-none absolute inset-0 z-0 bg-white pointer-events-none"
                style={{ 
                    opacity: showDiff ? 1 : 0, 
                    transition: "opacity 0.2s ease",
                    filter: showDiff ? "grayscale(50%)" : "none"
                }}
            />

            {/* User Output - On top - Normal colors */}
            <iframe
                title="user-output"
                srcDoc={previewDoc}
                className="w-full h-full border-none absolute inset-0 z-10 bg-white pointer-events-none"
                style={{ 
                    opacity: showDiff ? 0.7 : 1,
                    transition: "opacity 0.2s ease"
                }}
            />

            {/* Slide & Compare Overlay - Only visible when hovering */}
            {slideEnabled && isHovering && (
                <div 
                    className="absolute inset-0 z-20 pointer-events-none overflow-hidden bg-white"
                    style={{ 
                        width: `${sliderValue}%`,
                    }}
                >
                    <iframe
                        title="target-overlay"
                        srcDoc={targetSrcDoc}
                        className="absolute top-0 left-0 w-[400px] h-[300px] border-none bg-white"
                    />
                </div>
            )}

            {/* CSSBattle-style Slider Handle - Only visible when hovering (and not in diff mode) */}
            {slideEnabled && isHovering && !showDiff && (
              <div 
                className="absolute top-0 bottom-0 z-20 cursor-col-resize"
                style={{ 
                  left: `${sliderValue}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" />
                
                {/* Circle Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </div>

                {/* Labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">
                  TARGET
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">
                  YOURS
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#0a0a0c] p-4 pt-0">
        {/* Toggle Buttons */}
        <div className="flex items-center justify-center gap-1 bg-white/5 p-1 rounded-xl mb-4 max-w-xs mx-auto">
             <button 
                onClick={() => setActiveTab("your")}
                className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                     activeTab === "your" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
             >
                Your stats
             </button>
             <button 
                onClick={() => setActiveTab("global")}
                 className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                     activeTab === "global" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
             >
                Global stats
             </button>
        </div>

        {activeTab === "your" ? (
             <div className="grid grid-cols-2 gap-4">
                {/* High Score Card */}
                <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">High Score</span>
                        <Zap className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-white leading-none">{userStats?.best?.score || "-"}</div>
                    
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 mt-auto">
                        <div className="flex flex-col items-center group/stat" title="Accuracy">
                           <Target className="w-3 h-3 text-zinc-500 mb-0.5 group-hover/stat:text-primary transition-colors"/>
                           <span className="text-[10px] font-mono text-zinc-300">{userStats?.best?.accuracy || 0}%</span>
                        </div>
                        <div className="flex flex-col items-center group/stat" title="Characters">
                           <Hash className="w-3 h-3 text-zinc-500 mb-0.5 group-hover/stat:text-orange-400 transition-colors"/>
                           <span className="text-[10px] font-mono text-zinc-300">{userStats?.best?.chars || "-"}</span>
                        </div>
                        <div className="flex flex-col items-center group/stat" title="Time Taken">
                           <Clock className="w-3 h-3 text-zinc-500 mb-0.5 group-hover/stat:text-blue-400 transition-colors"/>
                           <span className="text-[10px] font-mono text-zinc-300">{formatTime(userStats?.best?.duration)}</span>
                        </div>
                    </div>
                </div>

                 {/* Last Score Card */}
                 <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Last Score</span>
                         <History className="w-3 h-3 text-zinc-400" />
                    </div>
                    <div className="text-2xl font-bold text-white leading-none">
                        {userStats?.latest ? userStats.latest.score : (lastScore?.score || "-")}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 mt-auto">
                         <div className="flex flex-col items-center group/stat" title="Accuracy">
                           <Target className="w-3 h-3 text-zinc-500 mb-0.5 group-hover/stat:text-primary transition-colors"/>
                           <span className="text-[10px] font-mono text-zinc-300">
                               {userStats?.latest ? userStats.latest.accuracy : (lastScore?.accuracy || 0)}%
                            </span>
                        </div>
                        <div className="flex flex-col items-center group/stat" title="Characters">
                           <Hash className="w-3 h-3 text-zinc-500 mb-0.5 group-hover/stat:text-orange-400 transition-colors"/>
                           <span className="text-[10px] font-mono text-zinc-300">
                                {userStats?.latest ? userStats.latest.chars : (lastScore?.chars || "-")}
                           </span>
                        </div>
                        <div className="flex flex-col items-center group/stat" title="Time Taken">
                           <Clock className="w-3 h-3 text-zinc-500 mb-0.5 group-hover/stat:text-blue-400 transition-colors"/>
                           <span className="text-[10px] font-mono text-zinc-300">
                                {userStats?.latest ? formatTime(userStats.latest.duration) : "-"}
                           </span>
                        </div>
                    </div>
                </div>
             </div>
        ) : (
            <div className="grid grid-cols-2 gap-2 text-center"> 
                 <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Target className="w-3 h-3"/> Avg Match</span>
                    <span className="text-sm font-bold text-white font-mono">{stats?.avgAccuracy || "0"}%</span>
                </div>
                 <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Hash className="w-3 h-3"/> Avg Chars</span>
                    <span className="text-sm font-bold text-white font-mono">{stats?.avgChars || "0"}</span>
                </div>
                 <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Avg Time</span>
                    <span className="text-sm font-bold text-white font-mono">{formatTime((stats as any)?.avgDuration || 0)}</span>
                </div>
                 <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500"/> Top Score</span>
                    <span className="text-sm font-bold text-white font-mono">{stats?.topScore || "-"}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
