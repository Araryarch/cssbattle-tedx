import { useState, useRef, useEffect } from "react";
import { Zap, Clock, Hash, History, Target, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChallengeStats } from "@/lib/hooks/useBattle";
import { ScoreResult } from "@/lib/scoring";
import Link from "next/link";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { unlockSolutionsAction } from "@/lib/submission-actions";
import { toast } from "sonner";

interface BattleMiddleProps {
  challengeId: string;
  previewDoc: string;
  targetCode?: string;
  stats: ChallengeStats | null;
  lastScore: ScoreResult | null;
  userStats: { 
      best: { score: number; accuracy: number; chars: number; duration: number } | null;
      latest: { score: number; accuracy: number; chars: number; duration: number } | null;
      isUnlocked?: boolean;
      isSolved?: boolean;
  } | null;
  showTarget: boolean;
  onUnlockSolutions: () => void;
  contestId?: string;
  contestStatus?: "active" | "ended" | "upcoming";
  endTime?: string | Date; // Added this
}

export default function BattleMiddle({
  challengeId,
  previewDoc,
  targetCode,
  stats,
  lastScore,
  userStats,
  onUnlockSolutions,
  contestId,
  contestStatus,
  endTime, // Added this
}: BattleMiddleProps) {
  const [activeTab, setActiveTab] = useState<"your" | "global">("your");
  const [slideEnabled, setSlideEnabled] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [showDiff, setShowDiff] = useState(false);
  const [showSolutionWarning, setShowSolutionWarning] = useState(false);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [timeLeftIsCritical, setTimeLeftIsCritical] = useState(false);

  useEffect(() => {
    if (!endTime || contestStatus !== "active") return;

    const targetDate = new Date(endTime).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft("ENDED");
        setTimeLeftIsCritical(false);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      // Critical if less than 1 minute (and at least 1 hour hasn't passed, though h will be 0)
      setTimeLeftIsCritical(h === 0 && m === 0);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime, contestStatus]);
  
  /* scaling logic */
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const targetSrcDoc = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${targetCode || ""}</body></html>`;

  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const { width } = wrapperRef.current.getBoundingClientRect();
        // Calculate scale to fit 400px width into available space (minus padding)
        const availableWidth = width - 32; // 32px for padding
        const newScale = Math.min(1, availableWidth / 400);
        setScale(Math.max(0.5, newScale)); // Don't scale too small
      }
    };

    // Initial calc
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!slideEnabled || !isHovering || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale; 
    const percent = Math.min(100, Math.max(0, (x / (rect.width / scale)) * 100));
    setSliderValue(percent);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (slideEnabled) document.body.style.cursor = 'col-resize';
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    document.body.style.cursor = '';
  };

  const isSolved = userStats?.isSolved || (userStats?.best?.accuracy || 0) >= 70;
  const isUnlocked = userStats?.isUnlocked || false;
  const canAccessSolutions = isSolved || isUnlocked;

  const handleSolutionsClick = (e: React.MouseEvent) => {
      if (!canAccessSolutions) {
          e.preventDefault();
          setShowSolutionWarning(true);
      }
  };

  const proceedToSolutions = async () => {
      try {
        const result = await unlockSolutionsAction(challengeId);
        if (result.success) {
            onUnlockSolutions(); // Optimistically unlock
            setShowSolutionWarning(false);
            window.open(`/battle/${challengeId}/solutions`, '_blank');
            toast.success("Solutions unlocked! Points forfeited.");
        } else {
            toast.error("Failed to unlock solutions");
        }
      } catch (error) {
          toast.error("An error occurred");
      }
  };

  return (
    <div className="flex-col bg-[#0a0a0c] h-full relative overflow-y-auto lg:overflow-visible custom-scrollbar">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0c] sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Code Output
            </span>
            {timeLeft && (
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5 text-primary animate-pulse" />
                    <span className="text-[9px] font-bold text-primary tracking-wider uppercase">{timeLeft}</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-4">
          {(!contestId || (contestId && contestStatus === 'ended')) && (
            <Link  
                href={`/battle/${challengeId}/solutions`}
                onClick={handleSolutionsClick}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors group"
                target="_blank"
                title={canAccessSolutions ? "View Solutions" : "Solutions Locked (Solve to view)"}
            >
                {canAccessSolutions ? (
                    <Unlock className="w-3 h-3 text-green-500/70 group-hover:text-green-400 transition-colors" />
                ) : (
                    <Lock className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                )}
                Solutions
            </Link>
          )}
          <div className="w-px h-4 bg-white/10 mx-2 hidden sm:block" />
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={slideEnabled}
              onChange={(e) => {
                  setSlideEnabled(e.target.checked);
              }}
              className="accent-primary w-3 h-3 cursor-pointer"
            />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:block", slideEnabled ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>
              Slide
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showDiff}
              onChange={(e) => setShowDiff(e.target.checked)}
              className="accent-primary w-3 h-3 cursor-pointer"
            />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:block", showDiff ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>
              Diff
            </span>
          </label>
        </div>
      </div>

      {/* Output Area */}
      <div className="p-4 bg-[#0a0a0c] flex items-center justify-center flex-1 min-h-[350px]" ref={wrapperRef}>
        <div 
            ref={containerRef}
            className="w-[400px] h-[300px] bg-white rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 relative select-none origin-center transition-transform duration-200 ease-out"
            style={{ 
                transform: `scale(${scale})`,
                marginBottom: `-${(1 - scale) * 150}px`,
                marginTop: `-${(1 - scale) * 150}px` 
            }}
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

            {/* Slider Handle */}
            {slideEnabled && isHovering && !showDiff && (
              <div 
                className="absolute top-0 bottom-0 z-20 cursor-col-resize"
                style={{ 
                  left: `${sliderValue}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">TARGET</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">YOURS</div>
              </div>
            )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#0a0a0c] p-4 pt-0">
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

      {timeLeft && (
        <div className="px-4 pb-8 mt-auto shrink-0">
             <div className={cn(
                 "bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden group transition-all duration-300",
                 timeLeftIsCritical && "border-primary/50 bg-primary/20 shadow-[0_0_30px_rgba(222,41,41,0.3)] animate-pulse"
             )}>
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none",
                    timeLeftIsCritical && "from-primary/40"
                )} />
                <div className={cn("flex items-center gap-2 text-zinc-500 mb-1 z-10 transition-colors", timeLeftIsCritical && "text-primary")}>
                    <Clock className={cn("w-3 h-3", timeLeftIsCritical && "animate-spin-slow")} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        {timeLeft === "ENDED" ? "Contest Finished" : timeLeftIsCritical ? "TIME IS RUNNING OUT!" : "Contest Ends In"}
                    </span>
                </div>
                <div className={cn(
                    "text-4xl font-black text-white font-mono tracking-tighter transition-all duration-300 z-10",
                    timeLeftIsCritical ? "text-primary text-5xl scale-110 drop-shadow-[0_0_20px_rgba(222,41,41,0.8)]" : "drop-shadow-[0_0_15px_rgba(222,41,41,0.3)]"
                )}>
                    {timeLeft}
                </div>
                <div className={cn(
                    "absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors",
                    timeLeftIsCritical && "bg-primary/30 blur-3xl scale-150"
                )} />
             </div>
        </div>
      )}

      <ConfirmationModal 
          isOpen={showSolutionWarning}
          onClose={() => setShowSolutionWarning(false)}
          onConfirm={proceedToSolutions}
          title="Solutions Locked"
          description="You haven't solved this challenge yet. Using solutions to learn is allowed, but you will forfeit points for this challenge if you choose to unlock them. Are you sure you want to proceed?"
          confirmLabel="Proceed to Unlock"
          cancelLabel="Cancel"
      />
    </div>
  );
}
