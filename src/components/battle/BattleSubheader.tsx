import Link from "next/link";
import {
  Play,
  Share2,
  ChevronLeft,
  TestTube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Challenge } from "@/lib/challenges";
import { ChallengeStats } from "@/lib/hooks/useBattle";

interface BattleSubheaderProps {
  id: string;
  challenge?: Challenge;
  stats: ChallengeStats | null;
  isTesting: boolean;
  isSubmitting: boolean;
  onTest: () => void;
  onSubmit: () => void;
}

export default function BattleSubheader({
  id,
  challenge,
  stats,
  isTesting,
  isSubmitting,
  onTest,
  onSubmit,
}: BattleSubheaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-bold text-sm tracking-widest uppercase text-white">
            {challenge?.title || `CHALLENGE #${id}`}
          </h2>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-0.5">
            <span>Target {id}</span>
            <span className="w-px h-2 bg-white/10" />
            <span>{challenge?.difficulty || "Normal"}</span>
            <span className="w-px h-2 bg-white/10" />
            <span>400×300</span>
            <span className="w-px h-2 bg-white/10" />
            <span className="text-yellow-500" title="Target Characters for Max Bonus">
              Target: {challenge?.targetChars || 200}
            </span>
            {stats && (
              <>
                <span className="w-px h-2 bg-white/10" />
                <span title="Avg Chars / Avg Accuracy">
                  Avg: {stats.avgChars}ch / {stats.avgAccuracy}%
                </span>
                <span className="w-px h-2 bg-white/10" />
                <span className="text-primary" title="Highest Score">Top: {stats.topScore}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTest}
          disabled={isTesting}
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white text-xs font-bold tracking-widest uppercase transition-all hover:bg-zinc-600",
            isTesting ? "opacity-50 cursor-not-allowed" : "active:scale-95",
          )}
        >
          {isTesting ? "Testing..." : "Test"}
          <TestTube className={cn("w-3 h-3", isTesting && "animate-pulse")} />
        </button>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-2 px-6 py-2 bg-primary text-white text-xs font-bold tracking-widest uppercase transition-all hover:bg-red-600",
            isSubmitting ? "opacity-50 cursor-not-allowed" : "active:scale-95",
          )}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
          <Play className={cn("w-3 h-3 fill-current", isSubmitting && "animate-pulse")} />
        </button>

        <button className="p-2 text-zinc-500 hover:text-white transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
