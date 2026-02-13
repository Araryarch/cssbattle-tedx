"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowRight, Trophy, Loader2 } from "lucide-react";
import { formatDistanceToNow, isFuture, isPast } from "date-fns";
import { useActiveContests } from "@/lib/hooks";

import { motion } from "framer-motion";

export default function ContestsPage() {
  const { data: contests = [], isLoading, isError } = useActiveContests();

  return (
    <div className="min-h-screen bg-black text-white">

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
              CONTESTS
            </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-light">
            Prove your skills in time-limited coding battles. Compete for the top spot on the leaderboard.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="p-12 border border-red-500/20 rounded-3xl bg-red-500/5 text-center">
            <h3 className="text-xl font-bold text-red-400">Failed to load contests</h3>
            <p className="text-zinc-500 mt-2">Please try again later.</p>
          </div>
        ) : (
        <div className="grid gap-8">
            {contests.length === 0 ? (
                <div className="p-12 border border-white/10 rounded-3xl bg-zinc-900/30 text-center">
                    <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-500">No Active Contests</h3>
                    <p className="text-zinc-600 mt-2">Check back soon for upcoming events.</p>
                </div>
            ) : (
                contests.map((contest, idx) => {
                    const startDate = new Date(contest.startTime);
                    const endDate = new Date(contest.endTime);
                    const isUpcoming = isFuture(startDate);
                    const isEnded = isPast(endDate);
                    const isLive = !isUpcoming && !isEnded;

                    return (
                        <motion.div
                          key={contest.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 transition-all">
                            {isLive && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_20px_theme(colors.red.500)]" />
                            )}
                            
                            <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                                <div className="space-y-3 flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        {isLive ? (
                                            <span className="px-2.5 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse">
                                                Live Now
                                            </span>
                                        ) : isUpcoming ? (
                                            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                Upcoming
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                Ended
                                            </span>
                                        )}
                                        <span className="text-xs text-zinc-500 font-mono">
                                            {isLive ? (
                                                `Ends in ${formatDistanceToNow(endDate)}`
                                            ) : isUpcoming ? (
                                                `Starts in ${formatDistanceToNow(startDate)}`
                                            ) : (
                                                `Ended ${formatDistanceToNow(endDate)} ago`
                                            )}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                                            {contest.title}
                                        </h2>
                                        <p className="text-zinc-400 text-sm line-clamp-2">
                                            {contest.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-5 text-xs text-zinc-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{startDate.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{startDate.toLocaleTimeString()} - {endDate.toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex-shrink-0">
                                    {isLive ? (
                                        <Link 
                                            href={`/contest/${contest.id}`}
                                            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-primary hover:bg-red-600 text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all hover:scale-105"
                                        >
                                            Enter Arena <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : isUpcoming ? (
                                        <Link 
                                            href={`/contest/${contest.id}`}
                                            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all hover:scale-105"
                                        >
                                            Join Now <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <Link 
                                            href={`/contest/${contest.id}/results`}
                                            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all"
                                        >
                                            View Results
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        </motion.div>
                    );
                })
            )}
        </div>
        )}
        </div>
      </main>
    </div>
  );
}
