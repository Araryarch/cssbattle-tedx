"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChallengeSolutionsAction } from "@/lib/submission-actions";
import { getChallengeAction } from "@/lib/challenge-actions";
import { Loader2, ArrowLeft, Trophy, Lock, Eye, Target, CalendarDays, Code, Hash, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SubmissionViewer from "@/components/admin/SubmissionViewer";

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
  const [selectedSolution, setSelectedSolution] = useState<any>(null);

  useEffect(() => {
    async function init() {
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
            }
        } catch (e) {
            console.error("Failed to load solutions", e);
        } finally {
            setLoading(false);
        }
    }
    init();
  }, [challengeId]);

  if (loading) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      );
  }

  if (!authorized) {
      return (
        <div className="min-h-screen bg-[#050505] p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <Lock className="w-10 h-10 text-zinc-500" />
             </div>
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                 Solutions Locked
             </h1>
             <p className="text-zinc-500 max-w-md">
                 You must solve this challenge first to view other players' solutions. Go back and give it your best shot!
             </p>
             <Link 
                href={`/battle/${challengeId}`}
                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors"
             >
                Start Battle
             </Link>
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
