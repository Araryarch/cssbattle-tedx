"use client";

import { useParams } from "next/navigation";
import { useContestResults } from "@/lib/hooks";
import Header from "@/components/Header";
import { Trophy, Crown, Medal, Users, Target, Clock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function ContestResultsPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { data, isLoading, isError } = useContestResults(contestId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 pt-32 text-center">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-400 mb-2">Results Not Available</h1>
          <p className="text-zinc-600 mb-6">This contest may not exist or has no results yet.</p>
          <Link href="/contest" className="text-primary hover:underline">
            ← Back to Contests
          </Link>
        </div>
      </div>
    );
  }

  const { contest, totalChallenges, leaderboard } = data;
  const isEnded = new Date() > new Date(contest.endTime);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Back Button + Title */}
          <div>
            <Link
              href="/contest"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Contests
            </Link>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contest Results</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{contest.title}</h1>
                {contest.description && (
                  <p className="text-zinc-500 mt-2 max-w-xl">{contest.description}</p>
                )}
              </div>

              <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${
                isEnded
                  ? "bg-zinc-800/50 text-zinc-500 border-zinc-700"
                  : "bg-green-500/10 text-green-500 border-green-500/20"
              }`}>
                {isEnded ? `Ended ${formatDistanceToNow(new Date(contest.endTime))} ago` : "Live"}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                <Users className="w-3.5 h-3.5" /> Participants
              </div>
              <span className="text-3xl font-black">{leaderboard.length}</span>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                <Target className="w-3.5 h-3.5" /> Challenges
              </div>
              <span className="text-3xl font-black">{totalChallenges}</span>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                <Clock className="w-3.5 h-3.5" /> End Time
              </div>
              <span className="text-lg font-bold">{format(new Date(contest.endTime), "PP p")}</span>
            </div>
          </motion.div>

          {/* Podium - Top 3 */}
          {leaderboard.length >= 3 && (
            <motion.div
              className="grid grid-cols-3 gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-500 flex items-center justify-center text-xl font-black overflow-hidden mb-3">
                  {leaderboard[1].userImage ? (
                    <img src={leaderboard[1].userImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    leaderboard[1].userName.charAt(0).toUpperCase()
                  )}
                </div>
                <Medal className="w-6 h-6 text-zinc-400 mb-1" />
                <p className="font-bold text-sm text-center truncate max-w-full">{leaderboard[1].userName}</p>
                <p className="text-primary font-mono font-bold text-lg">{leaderboard[1].totalScore}</p>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-yellow-500 flex items-center justify-center text-2xl font-black overflow-hidden mb-3 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  {leaderboard[0].userImage ? (
                    <img src={leaderboard[0].userImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    leaderboard[0].userName.charAt(0).toUpperCase()
                  )}
                </div>
                <Crown className="w-7 h-7 text-yellow-500 fill-current mb-1" />
                <p className="font-bold text-center truncate max-w-full">{leaderboard[0].userName}</p>
                <p className="text-primary font-mono font-bold text-xl">{leaderboard[0].totalScore}</p>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-amber-700 flex items-center justify-center text-lg font-black overflow-hidden mb-3">
                  {leaderboard[2].userImage ? (
                    <img src={leaderboard[2].userImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    leaderboard[2].userName.charAt(0).toUpperCase()
                  )}
                </div>
                <Medal className="w-5 h-5 text-amber-700 mb-1" />
                <p className="font-bold text-sm text-center truncate max-w-full">{leaderboard[2].userName}</p>
                <p className="text-primary font-mono font-bold text-lg">{leaderboard[2].totalScore}</p>
              </div>
            </motion.div>
          )}

          {/* Full Leaderboard Table */}
          <motion.div
            className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-20 text-center">Rank</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Participant</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center hidden md:table-cell">Solved</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <tr key={entry.userId} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-center">
                      {entry.rank === 1 && <Crown className="w-5 h-5 text-yellow-500 mx-auto fill-current" />}
                      {entry.rank === 2 && <Medal className="w-5 h-5 text-zinc-400 mx-auto" />}
                      {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-700 mx-auto" />}
                      {entry.rank > 3 && (
                        <span className="font-mono text-zinc-500 font-bold">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10 flex-shrink-0">
                          {entry.userImage ? (
                            <img src={entry.userImage} alt={entry.userName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-primary to-purple-600">
                              {entry.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{entry.userName}</div>
                          <div className="text-[10px] text-zinc-600 font-mono">
                            {format(new Date(entry.lastSubmissionTime), "PP p")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono text-zinc-400 text-sm hidden md:table-cell">
                      {entry.challengesCompleted} / {totalChallenges}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold font-mono">
                        {entry.totalScore.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}

                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-zinc-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No Submissions Yet</p>
                      <p className="text-xs text-zinc-600 mt-1">Results will appear when participants submit code.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
