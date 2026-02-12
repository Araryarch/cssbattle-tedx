"use client";

import { useEffect, useState } from "react";
import { getGlobalLeaderboardAction } from "@/lib/submission-actions";
import { Loader2, Trophy, Medal, Crown, Shield, Target, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  totalScore: number;
  challengesSolved: number;
  rank: number;
  rankTitle: string;
}

export default function GlobalLeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalLeaderboardAction().then((res) => {
        setData(res);
        setLoading(false);
    });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300 fill-zinc-300/20" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400 fill-orange-400/20" />;
    return <span className="font-mono text-zinc-500 w-5 text-center">#{rank}</span>;
  };

  const getRankColor = (title: string) => {
      switch(title) {
          case "Grandmaster": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
          case "Master": return "text-red-400 bg-red-400/10 border-red-400/20";
          case "Expert": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
          case "Apprentice": return "text-green-400 bg-green-400/10 border-green-400/20";
          default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                   <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm flex items-center gap-2">
                     <Trophy className="w-8 h-8 text-yellow-500" /> Global Leaderboard
                   </h1>
                   <p className="text-zinc-500 text-sm mt-1">Compete with tailored challenges and rise through the ranks!</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="glass border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
           {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
           ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-zinc-500 uppercase font-bold tracking-wider border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-center w-16">Rank</th>
                                <th className="px-6 py-4 w-2/5">User</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-center">Challenges</th>
                                <th className="px-6 py-4 text-right">Title</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">No rankings yet. Start coding!</td></tr>
                            ) : (
                                data.map((entry) => (
                                    <tr key={entry.userId} className={cn("hover:bg-white/5 transition-colors group", entry.rank === 1 && "bg-yellow-500/5")}>
                                        <td className="px-6 py-4 text-center font-bold text-lg">
                                            <div className="flex justify-center items-center">{getRankIcon(entry.rank)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className={cn("font-bold", entry.rank <= 3 ? "text-white" : "text-zinc-300")}>{entry.userName || "Anonymous"}</span>
                                                    {/* Hide email slightly for privacy */}
                                                    {/* <span className="text-xs text-zinc-600 font-mono">{entry.userEmail?.split('@')[0]}***</span> */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono font-bold text-yellow-500 text-lg">{entry.totalScore.toFixed(0)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-xs font-mono text-zinc-400">
                                                <Target className="w-3 h-3" /> {entry.challengesSolved}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getRankColor(entry.rankTitle))}>
                                                {entry.rankTitle}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
           )}
        </div>
      </div>
    </div>
  );
}
