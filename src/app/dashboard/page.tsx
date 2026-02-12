"use client";

import { Trophy, Clock, Target, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useDashboard } from "@/lib/hooks";
import Header from "@/components/Header";

export default function UserDashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Header />
        <div className="max-w-6xl mx-auto p-12 text-center">
          <p className="text-zinc-500">Please <Link href="/login" className="text-primary hover:underline">login</Link> to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const { stats, recentSubmissions, activeContests } = data;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">My Dashboard</h1>
          <p className="text-zinc-500">Welcome back, get ready to code.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-white/10 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">Total Score</span>
                    <span className="text-4xl font-black text-white">
                        {stats.totalScore}
                    </span>
                </div>
            </div>

             <div className="bg-zinc-900/50 border border-white/10 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">Avg. Accuracy</span>
                    <span className="text-4xl font-black text-white">{stats.avgAccuracy}%</span>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Clock className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">Challenges Done</span>
                    <span className="text-4xl font-black text-white">{stats.uniqueChallenges}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Activity */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-500" /> Recent Submissions
                </h2>
                <div className="bg-zinc-900/40 border border-white/10 overflow-hidden">
                    {recentSubmissions.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {recentSubmissions.map((sub) => (
                                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div>
                                        <div className="font-bold text-sm text-white mb-1">
                                            Challenge #{sub.challengeId}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {format(new Date(sub.createdAt), "PP p")}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white">{sub.score}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${parseFloat(sub.accuracy) >= 90 ? 'text-green-500' : 'text-zinc-500'}`}>
                                            {sub.accuracy}% Match
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-zinc-500 text-sm">
                            No submissions yet. Start battling!
                        </div>
                    )}
                </div>
            </div>

            {/* Active Contests & Quick Links */}
            <div className="space-y-8">
                 <div className="space-y-6">
                    <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-zinc-500" /> Active Contests
                    </h2>
                    {activeContests.length > 0 ? (
                        <div className="grid gap-4">
                            {activeContests.map(contest => (
                                <div key={contest.id} className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 group hover:border-primary/50 transition-all">
                                    <h3 className="text-lg font-bold mb-2">{contest.title}</h3>
                                    <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{contest.description || "Join now and compete with others."}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-mono text-zinc-500">
                                            Ends: {format(new Date(contest.endTime), "PP")}
                                        </div>
                                        <Link href={`/contest/${contest.id}`} className="px-4 py-2 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-colors">
                                            Join Now
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="p-8 border border-dashed border-white/10 text-center text-zinc-500 text-sm">
                            No active contests at the moment.
                        </div>
                    )}
                </div>

                <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl">
                    <h3 className="font-bold text-primary mb-2">Ready to practice?</h3>
                    <p className="text-sm text-zinc-400 mb-4">Sharpen your CSS skills with our collection of daily targets.</p>
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white hover:underline">
                        Go to Battle Arena <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">Global Leaderboard</h3>
                    <p className="text-sm text-zinc-400 mb-4">See where you stand among other CSS wizards.</p>
                    <Link href="/leaderboard" className="flex items-center gap-2 text-sm font-bold text-white hover:underline">
                        View Rankings <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
