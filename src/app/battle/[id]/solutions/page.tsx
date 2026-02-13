"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChallengeSolutionsAction, unlockSolutionsAction } from "@/lib/submission-actions";
import { getChallengeAction } from "@/lib/challenge-actions";
import { Loader2, ArrowLeft, Trophy, Lock, Eye, Target, CalendarDays, Code, Hash, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SubmissionViewer from "@/components/admin/SubmissionViewer";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

interface Solution {
  id: string;
  userId: string | null;
  userName: string | null;
  code: string;
  score: string;
  accuracy: string;
  duration: number | null;
  chars: number | null;
  createdAt: Date;
  commentCount: number;
}

export default function BattleSolutionsPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authReason, setAuthReason] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isUnlocking, startTransition] = useTransition();

  async function loadData() {
        setLoading(true);
        try {
            const [challengesResult, solutionsResult] = await Promise.all([
                getChallengeAction(challengeId),
                getChallengeSolutionsAction(challengeId)
            ]);
            
            setChallenge(challengesResult);
            if (solutionsResult.authorized) {
                setAuthorized(true);
                setSolutions(solutionsResult.solutions.map(s => ({ ...s, createdAt: new Date(s.createdAt) })));
            } else {
                setAuthorized(false);
                setAuthReason(solutionsResult.reason || null);
            }
        } catch (e) {
            console.error("Failed to load solutions", e);
        } finally {
            setLoading(false);
        }
    }

  useEffect(() => {
    loadData();
  }, [challengeId]);

  const handleUnlock = () => {
      startTransition(async () => {
          const res = await unlockSolutionsAction(challengeId);
          if (res.success) {
              toast.success("Solutions unlocked. You will not earn points for this challenge.");
              setShowUnlockModal(false);
              loadData(); // Reload to get solutions
          } else {
              toast.error(res.error || "Failed to unlock solutions");
          }
      });
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      );
  }

  if (!authorized) {
      if (authReason === "Contest in progress") {
           return (
            <div className="min-h-screen bg-[#050505] p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <Lock className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white">
                    Contest in Progress
                </h1>
                <p className="text-zinc-500 max-w-md">
                    Solutions are hidden while the contest is active to ensure fair play. 
                    Come back after the contest ends!
                </p>
                <Link 
                    href={`/contest/${challenge?.contestId || ""}`}
                    className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors"
                >
                    View Contest
                </Link>
            </div>
           );
      }

      return (
        <div className="min-h-screen bg-[#050505] p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <Lock className="w-10 h-10 text-zinc-500" />
             </div>
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                 Solutions Locked
             </h1>
             <p className="text-zinc-500 max-w-md">
                 You haven't solved this challenge yet! viewing the solutions is the best way to learn, but we recommend you to try harder first
             </p>
             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                 <Link 
                    href={`/battle/${challengeId}`}
                    className="flex-1 px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors text-xs flex items-center justify-center"
                 >
                    Start Battle
                 </Link>
                 <button
                    onClick={() => setShowUnlockModal(true)}
                    className="flex-1 px-6 py-3 bg-white/5 text-zinc-400 font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 hover:text-white transition-colors text-xs flex items-center justify-center border border-white/5"
                 >
                    Uncover Solutions
                 </button>
             </div>
             
             <ConfirmationModal 
                isOpen={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                onConfirm={handleUnlock}
                title="Unlock Solutions?"
                description="Warning: If you view the solutions now, you will NOT earn any points for this challenge in the future, even if you solve it correctly later. Are you sure you want to proceed?"
                confirmLabel="Yes, Unlock & Forfeit Points"
                cancelLabel="No, I'll Try Solving It"
                isLoading={isUnlocking}
             />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href={`/battle/${challengeId}`} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white group" title="Back to Battle">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                   <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                     Solutions <span className="text-zinc-500 font-normal text-xl">for {challenge?.title || "Challenge"}</span>
                   </h1>
                   <p className="text-zinc-500 text-sm mt-1">Check out how others solved this challenge. Analyze their code and learn new tricks!</p>
                </div>
            </div>
            {/* Stats? */}
            <div className="text-xs font-mono text-zinc-500 border border-white/5 px-3 py-1.5 rounded-lg bg-white/5">
                {solutions.length} submissions found
            </div>
        </div>

        {/* Challenge Details Card */}
        {challenge && (
            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="w-full md:w-64 aspect-[4/3] bg-black rounded-lg border border-white/10 overflow-hidden flex-shrink-0 relative group shadow-2xl">
                     {challenge.imageUrl ? (
                         <img src={challenge.imageUrl} alt="" className="w-full h-full object-contain" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">No Preview</div>
                     )}
                     <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 shadow-lg">
                         Target Output
                     </div>
                </div>
                
                <div className="flex-1 space-y-5 w-full">
                     <div>
                         <div className="flex items-center gap-3 mb-3">
                             <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                 challenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-900/10' : 
                                 challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-900/10' : 
                                 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-900/10'
                             }`}>
                                 {challenge.difficulty}
                             </span>
                         </div>
                         <h2 className="text-2xl font-black text-white mb-3 tracking-tight">{challenge.title}</h2>
                         <p className="text-zinc-400 leading-relaxed text-sm max-w-2xl">
                             {challenge.description || "No description provided for this challenge."}
                         </p>
                     </div>
                     
                     {/* Stats Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-white/5 w-full">
                         <div className="space-y-1">
                             <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5 ">
                                 <Target className="w-3 h-3" /> Avg Accuracy
                             </p>
                             <p className="font-mono font-bold text-white text-lg">{challenge.stats?.avgAccuracy || "0.0"}%</p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                                 <Trophy className="w-3 h-3" /> Top Score
                             </p>
                             <p className="font-mono font-bold text-primary text-lg">{challenge.stats?.topScore || "0"}</p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                                 <Code className="w-3 h-3" /> Avg Chars
                             </p>
                             <p className="font-mono font-bold text-white text-lg">{challenge.stats?.avgChars || "0"}</p>
                         </div>
                         <div className="space-y-1">
                             <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                                 <Clock className="w-3 h-3" /> Avg Time
                             </p>
                             <p className="font-mono font-bold text-white text-lg">{challenge.stats?.avgDuration ? Math.round(challenge.stats.avgDuration / 60) + "m" : "--"}</p>
                         </div>
                     </div>
                </div>
            </div>
        )}

        {/* Unlock Warning Banner (if authorized but with 0 score/unlocked) - Optional logic */}
        {/* We assume if they are authorized, they either solved it OR unlocked it. */}

        {/* Solutions List (Cards) */}
        <div className="flex flex-col gap-4 max-w-5xl mx-auto">
            {solutions.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 italic bg-white/5 rounded-2xl border border-white/5">
                    No other solutions yet. You are the pioneer!
                </div>
            ) : (
                solutions.map((sol) => (
                    <div 
                        key={sol.id} 
                        className="bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-xs text-zinc-300 border border-white/5">
                                    {sol.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col leading-none gap-1">
                                    <span className="font-bold text-sm text-white">{sol.userName || "Anonymous"}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {sol.createdAt.toLocaleDateString()} • {sol.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded text-xs font-bold font-mono border border-yellow-500/20">
                                    {sol.score} PTS
                                </div>
                            </div>
                        </div>

                        {/* Code Snippet */}
                        <div className="relative bg-[#050505] group/code">
                            <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-400 bg-[#050505] leading-relaxed tab-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[250px] overflow-y-hidden mask-bottom">
                                <code>{sol.code}</code>
                            </pre>
                            {/* Overlay Gradient for truncation effect */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
                            
                            {/* View Button Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/code:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => setSelectedSolution({
                                        ...sol,
                                        challengeTitle: challenge.title,
                                        challengeTarget: challenge.targetCode,
                                        challengeImage: challenge.imageUrl
                                    })}
                                    className="px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                                >
                                    <Code className="w-4 h-4" /> View Full Solution
                                </button>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center gap-6 text-xs text-zinc-500 font-mono">
                            <div className="flex items-center gap-1.5" title="Match Accuracy">
                                <Target className="w-3.5 h-3.5 text-blue-400/80" />
                                <span>{sol.accuracy}% Match</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Character Count">
                                <Hash className="w-3.5 h-3.5 text-orange-400/80" />
                                <span>{sol.chars ?? sol.code.length} chars</span>
                            </div>
                            {sol.duration && (
                                <div className="flex items-center gap-1.5" title="Time Taken">
                                    <Clock className="w-3.5 h-3.5 text-green-400/80" />
                                    <span>{Math.round(sol.duration / 60)}m</span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-1.5" title="Comments">
                                <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                                <span>{sol.commentCount || 0}</span>
                            </div>
                            
                            <div className="ml-auto">
                                <button
                                    onClick={() => setSelectedSolution({
                                        ...sol,
                                        challengeTitle: challenge.title,
                                        challengeTarget: challenge.targetCode,
                                        challengeImage: challenge.imageUrl
                                    })}
                                    className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    Details <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
      
      {/* Detail Modal */}
      {selectedSolution && (
        <SubmissionViewer
            submission={selectedSolution}
            onClose={() => setSelectedSolution(null)}
        />
      )}
    </div>
  );
}
