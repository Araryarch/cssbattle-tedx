"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChallengeSolutionsAction } from "@/lib/submission-actions";
import { getChallengeAction } from "@/lib/challenge-actions";
import { Loader2, ArrowLeft, Trophy, Lock, Eye, Target, CalendarDays, Code, Hash, Clock } from "lucide-react";
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

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 italic bg-white/5 rounded-2xl border border-white/5">
                    No other solutions yet. You are the pioneer!
                </div>
            ) : (
                solutions.map((sol) => (
                    <div key={sol.id} className="glass border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group flex flex-col h-full hover:shadow-xl hover:shadow-primary/5">
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-xs text-zinc-300">
                                    {sol.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="font-bold text-sm text-white">{sol.userName || "Anonymous"}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{sol.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-mono font-bold text-yellow-500 leading-none">{sol.score}</span>
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Points</span>
                            </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5 bg-white/[0.02]">
                            <div className="p-2 flex flex-col items-center justify-center gap-0.5" title="Accuracy">
                                <Target className="w-3 h-3 text-blue-400 opacity-70" />
                                <span className="text-xs font-mono text-zinc-300">{sol.accuracy}%</span>
                            </div>
                            <div className="p-2 flex flex-col items-center justify-center gap-0.5" title="Characters">
                                <Hash className="w-3 h-3 text-orange-400 opacity-70" />
                                <span className="text-xs font-mono text-zinc-300">{sol.chars ?? sol.code.length}</span>
                            </div>
                            <div className="p-2 flex flex-col items-center justify-center gap-0.5" title="Duration">
                                <Clock className="w-3 h-3 text-green-400 opacity-70" />
                                <span className="text-xs font-mono text-zinc-300">{Math.round(sol.duration ? sol.duration / 60 : 0)}m</span>
                            </div>
                        </div>

                        {/* Preview (Small) & Action */}
                        <div className="flex-1 p-4 bg-[#0a0a0c] relative group-hover:bg-[#0f0f11] transition-colors flex flex-col items-center justify-center gap-4">
                             {/* Mini Preview */}
                             <div className="w-full aspect-[4/3] bg-white rounded overflow-hidden relative ring-1 ring-white/10 opacity-60 group-hover:opacity-100 transition-opacity">
                                <iframe 
                                    srcDoc={`<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:white;transform:scale(0.5);transform-origin:top left;width:200%;height:200%;}</style></head><body>${sol.code}</body></html>`} 
                                    className="w-full h-full border-none pointer-events-none" 
                                    title="preview"
                                />
                             </div>
                             
                             <button
                                onClick={() => setSelectedSolution({
                                    ...sol,
                                    challengeTitle: challenge.title,
                                    challengeTarget: challenge.targetCode,
                                    challengeImage: challenge.imageUrl
                                })}
                                className="w-full py-2 bg-white/5 hover:bg-white text-white hover:text-black font-bold text-xs uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 group/btn"
                             >
                                <Eye className="w-3 h-3 group-hover/btn:scale-110 transition-transform"/> View Code
                             </button>
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
