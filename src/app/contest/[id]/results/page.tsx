"use client";

import { useParams } from "next/navigation";
import { useContestResults } from "@/lib/hooks";
import { Trophy, Crown, Medal, Users, Target, Clock, ArrowLeft, Loader2, ChevronDown, ChevronUp, Eye, Code, Terminal } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState, Fragment } from "react";
import { getContestUserSubmissionsAction } from "@/lib/submission-actions";
import { toast } from "sonner";
import SubmissionViewer from "@/components/admin/SubmissionViewer";

export default function ContestResultsPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { data, isLoading, isError } = useContestResults(contestId);

  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, any[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-black text-white">
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

  const toggleExpand = async (userId: string) => {
    if (expandedUser === userId) {
        setExpandedUser(null);
        return;
    }
    setExpandedUser(userId);
    
    // Fetch if not cached
    if (!userDetails[userId]) {
        setLoadingDetails(userId);
        const res = await getContestUserSubmissionsAction(contestId, userId);
        if (res.success && res.results) {
            setUserDetails(prev => ({ ...prev, [userId]: res.results! }));
        } else {
             toast.error(res.error || "Failed to load details");
             // If restricted (contest active), maybe show that message
        }
        setLoadingDetails(null);
    }
  }

  const openSubmission = (result: any, user: any) => {
      if (!result.submission) return;
      
      setViewingSubmission({
          id: result.submission.id || "preview", // Fallback if ID missing in some projections
          userName: user.userName,
          challengeTitle: result.challenge.title,
          challengeTarget: result.challenge.targetCode,
          challengeImage: result.challenge.imageUrl,
          code: result.submission.code,
          score: result.submission.score.toString(),
          accuracy: result.submission.accuracy.toString(),
          duration: result.submission.duration,
          chars: result.submission.chars,
          createdAt: new Date(result.submission.createdAt),
      });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
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
          {leaderboard.length > 0 && (
            <motion.div 
                className="flex justify-center items-end gap-4 md:gap-8 py-8 mb-8 min-h-[300px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* 2nd Place */}
                <div className="flex flex-col items-center w-1/3 max-w-[150px]">
                    {leaderboard[1] ? (
                        <>
                            <div className="mb-4 flex flex-col items-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-zinc-400 overflow-hidden bg-zinc-800 mb-2 ring-4 ring-zinc-400/10">
                                    {leaderboard[1].userImage ? (
                                        <img src={leaderboard[1].userImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 text-xl">{leaderboard[1].userName?.charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                                <span className="font-bold text-xs md:text-sm truncate max-w-full mb-1 text-zinc-300">{leaderboard[1].userName}</span>
                                <span className="text-zinc-400 font-mono font-bold text-xs">{leaderboard[1].totalScore} pts</span>
                            </div>
                            <div className="w-full h-24 md:h-32 bg-gradient-to-t from-zinc-800 to-zinc-800/20 border-t border-zinc-700 rounded-t-xl flex items-start justify-center pt-4 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                                <span className="font-black text-4xl text-zinc-700/50 select-none">2</span>
                            </div>
                        </>
                    ) : (
                         <div className="w-full h-24 md:h-32 bg-transparent" /> 
                    )}
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center w-1/3 max-w-[180px] z-10 -mt-8 mx-2">
                     <div className="mb-4 flex flex-col items-center relative">
                         <div className="absolute -top-12 animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                             <Crown className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                         </div>
                         <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-500 overflow-hidden bg-zinc-800 mb-3 shadow-[0_0_30px_rgba(234,179,8,0.4)] ring-4 ring-yellow-500/20">
                             {leaderboard[0].userImage ? (
                                 <img src={leaderboard[0].userImage} alt="" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center font-bold text-yellow-500 text-3xl">{leaderboard[0].userName?.charAt(0).toUpperCase()}</div>
                             )}
                         </div>
                         <span className="font-bold text-sm md:text-lg truncate max-w-full mb-1 text-white">{leaderboard[0].userName}</span>
                         <span className="text-yellow-500 font-mono font-bold text-sm md:text-lg drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{leaderboard[0].totalScore} pts</span>
                     </div>
                     <div className="w-full h-32 md:h-44 bg-gradient-to-t from-yellow-900/40 to-yellow-500/10 border-t border-yellow-500/50 rounded-t-xl flex items-start justify-center pt-4 relative overflow-hidden shadow-[0_-10px_30px_rgba(234,179,8,0.15)]">
                         <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                         <span className="font-black text-6xl text-yellow-500/20 select-none relative z-10">1</span>
                     </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center w-1/3 max-w-[150px]">
                    {leaderboard[2] ? (
                        <>
                            <div className="mb-4 flex flex-col items-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-amber-700 overflow-hidden bg-zinc-800 mb-2 ring-4 ring-amber-700/10">
                                    {leaderboard[2].userImage ? (
                                        <img src={leaderboard[2].userImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-amber-700 text-xl">{leaderboard[2].userName?.charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                                <span className="font-bold text-xs md:text-sm truncate max-w-full mb-1 text-zinc-300">{leaderboard[2].userName}</span>
                                <span className="text-amber-700 font-mono font-bold text-xs">{leaderboard[2].totalScore} pts</span>
                            </div>
                            <div className="w-full h-16 md:h-20 bg-gradient-to-t from-amber-900/40 to-amber-700/10 border-t border-amber-800/50 rounded-t-xl flex items-start justify-center pt-4 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                                <span className="font-black text-4xl text-amber-800/50 select-none">3</span>
                            </div>
                        </>
                    ) : (
                         <div className="w-full h-16 md:h-20 bg-transparent" />
                    )}
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
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <Fragment key={entry.userId}>
                  <tr 
                    onClick={() => toggleExpand(entry.userId)}
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${expandedUser === entry.userId ? 'bg-white/5' : ''}`}
                  >
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
                    <td className="p-4 text-center">
                        {expandedUser === entry.userId ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  <AnimatePresence>
                  {expandedUser === entry.userId && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                          <td colSpan={5} className="p-0 bg-black/20">
                              <div className="p-6 border-b border-white/5 space-y-4">
                                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                      <Terminal className="w-4 h-4" /> Submission Details
                                  </h4>
                                  
                                  {loadingDetails === entry.userId ? (
                                      <div className="flex justify-center py-4">
                                          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                                      </div>
                                  ) : userDetails[entry.userId] ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {userDetails[entry.userId].map((result: any, i: number) => (
                                              <div key={result.challenge.id} className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden group flex flex-col h-full">
                                                  {/* Header: Title & Difficulty */}
                                                  <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                                                      <div className="flex items-center gap-2 overflow-hidden">
                                                          <span className="text-xs font-bold truncate">{i+1}. {result.challenge.title}</span>
                                                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                                              result.challenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                                              result.challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                              'bg-red-500/10 text-red-400'
                                                          }`}>
                                                              {result.challenge.difficulty}
                                                          </span>
                                                      </div>
                                                      {result.submission ? (
                                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${Number(result.submission.accuracy) === 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                             {Number(result.submission.accuracy)}% Match
                                                         </span>
                                                      ) : (
                                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 whitespace-nowrap">
                                                              Unsolved
                                                          </span>
                                                      )}
                                                  </div>
                                                  
                                                  <div className="p-4 flex-1 flex flex-col gap-4">
                                                      {/* Challenge Visual Context */}
                                                      <div className="flex gap-4">
                                                          <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                                                              {result.challenge.imageUrl ? (
                                                                  <img src={result.challenge.imageUrl} alt="" className="w-full h-full object-cover" />
                                                              ) : (
                                                                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">No Img</div>
                                                              )}
                                                          </div>
                                                          <div className="flex-1 min-w-0">
                                                              <p className="text-xs text-zinc-400 line-clamp-2 md:line-clamp-3 mb-2">{result.challenge.description || "No description available."}</p>
                                                          </div>
                                                      </div>

                                                      {/* Submission Stats */}
                                                      {result.submission ? (
                                                          <div className="mt-auto space-y-3">
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div className="bg-black/30 p-2 rounded border border-white/5">
                                                                    <div className="text-zinc-500 text-[10px] uppercase">Score</div>
                                                                    <div className="font-mono font-bold text-primary">{result.submission.score}</div>
                                                                </div>
                                                                <div className="bg-black/30 p-2 rounded border border-white/5">
                                                                    <div className="text-zinc-500 text-[10px] uppercase">Chars</div>
                                                                    <div className="font-mono font-bold text-white">{result.submission.chars || 0}</div>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openSubmission(result, entry);
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                                            >
                                                                <Code className="w-3 h-3" /> View Solution
                                                            </button>
                                                          </div>
                                                      ) : (
                                                          <div className="mt-auto py-2 text-center text-zinc-600 text-xs italic bg-zinc-900/30 rounded-lg border border-white/5">
                                                              No submission recorded
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="text-center text-zinc-500 py-4">Failed to load details</div>
                                  )}
                              </div>
                          </td>
                      </motion.tr>
                  )}
                  </AnimatePresence>
                  </Fragment>
                ))}

                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500">
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

      {/* Submission Viewer Modal */}
      {viewingSubmission && (
          <SubmissionViewer 
            submission={viewingSubmission} 
            onClose={() => setViewingSubmission(null)} 
          />
      )}
    </div>
  );
}
