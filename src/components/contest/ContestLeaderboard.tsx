"use client";

import { useEffect, useState } from "react";
import { getContestLeaderboardAction } from "@/lib/submission-actions";
import { cn } from "@/lib/utils";
import { Trophy, Medal, User } from "lucide-react";

interface ContestLeaderboardProps {
  contestId: string;
  variant?: "sidebar" | "full";
}

export default function ContestLeaderboard({ contestId, variant = "sidebar" }: ContestLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getContestLeaderboardAction(contestId);
      setLeaderboard(data);
      setLoading(false);
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [contestId]);

  if (loading) return <div className="text-zinc-500 text-xs p-4">Loading stats...</div>;

  const isFull = variant === "full";

  return (
    <div className={cn("flex flex-col h-full bg-[#0a0a0c] overflow-hidden", isFull && "max-w-4xl mx-auto w-full")}>
      <div className={cn("p-4 py-3 border-b border-white/5 bg-[#0a0a0c] sticky top-0 z-10 flex items-center justify-between", isFull && "py-6")}>
        <span className={cn("text-[10px] font-bold text-zinc-500 uppercase tracking-widest", isFull && "text-xl")}>
            Contest Leaderboard
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
           <div className="space-y-1">
               {leaderboard.length === 0 ? (
                    <div className="text-zinc-500 text-xs text-center py-4">No ranked players yet</div>
               ) : (
                   leaderboard.map((entry, idx) => (
                       <div key={entry.userId} className={cn(
                           "flex items-center gap-3 p-2 rounded-lg transition-colors border border-transparent",
                           idx === 0 ? "bg-yellow-500/10 border-yellow-500/20" : 
                           idx === 1 ? "bg-zinc-400/10 border-zinc-400/20" : 
                           idx === 2 ? "bg-orange-700/10 border-orange-700/20" : "hover:bg-white/5",
                           isFull && "p-4 gap-6"
                       )}>
                           <div className={cn(
                               "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                               idx === 0 ? "text-yellow-500" :
                               idx === 1 ? "text-zinc-400" :
                               idx === 2 ? "text-orange-600" : "text-zinc-600",
                               isFull && "w-10 h-10 text-lg"
                           )}>
                               {idx + 1}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                               <div className={cn("text-xs font-bold text-zinc-300 truncate", isFull && "text-lg")}>{entry.userName || "Anonymous"}</div>
                               <div className={cn("text-[10px] text-zinc-600 truncate", isFull && "text-sm")}>{entry.challengesSolved} solved</div>
                           </div>

                           <div className="text-right">
                               <div className={cn("text-xs font-bold text-zinc-300 font-mono", isFull && "text-xl text-primary")}>{(entry.totalScore || 0).toLocaleString()}</div>
                               <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">PTS</div>
                           </div>
                       </div>
                   ))
               )}
           </div>
      </div>
    </div>
  );
}
