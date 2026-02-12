"use client";

import { useContest } from "@/lib/hooks";
import { ArrowLeft, Clock, Play, Trophy, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useParams } from "next/navigation";

export default function ContestPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { data: contest, isLoading, isError } = useContest(contestId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !contest) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-8">
        <div className="max-w-5xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold text-zinc-500 mb-4">Contest Not Found</h1>
          <Link href="/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isActive = contest.isActive;
  const isExpired = new Date() > new Date(contest.endTime);
  const challengesList = contest.challenges || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex justify-between items-start">
            <div>
                 <h1 className="text-4xl font-black tracking-tight mb-2">{contest.title}</h1>
                 <p className="text-zinc-400 text-lg max-w-2xl">{contest.description}</p>
            </div>
            {isExpired ? (
                <div className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold uppercase tracking-widest border border-red-500/20">
                    Ended
                </div>
            ) : isActive ? (
                 <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold uppercase tracking-widest border border-green-500/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Now
                </div>
            ) : (
                <div className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm font-bold uppercase tracking-widest border border-yellow-500/20">
                    Upcoming
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 mt-6 text-sm text-zinc-500">
             <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Starts: {format(new Date(contest.startTime), "PP p")}</span>
             </div>
             <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Ends: {format(new Date(contest.endTime), "PP p")}</span>
             </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-widest border-b border-white/10 pb-4">
                Contest Targets
            </h2>
            
            {challengesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challengesList.map((challenge: any, index: number) => (
                        <div key={challenge.id} className="group relative bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all hover:-translate-y-1">
                             <div className="aspect-[4/3] bg-zinc-900 relative">
                                {challenge.targetCode ? (
                                    <iframe
                                        srcDoc={`<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:white;display:flex;justify-content:center;align-items:center;}#scale-wrapper{transform:scale(0.75);transform-origin:center;width:400px;height:300px;overflow:hidden;}</style></head><body><div id="scale-wrapper">${challenge.targetCode}</div></body></html>`}
                                        className="w-full h-full border-none pointer-events-none"
                                        title={challenge.title}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold">No Preview</div>
                                )}
                                
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white">
                                    Target #{index + 1}
                                </div>
                             </div>
                             
                             <div className="p-5">
                                <h3 className="font-bold text-lg mb-1 truncate">{challenge.title}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                        challenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                        challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                        {challenge.difficulty}
                                    </span>
                                    
                                     <Link
                                        href={`/battle/${challenge.id}?contestId=${contestId}`}
                                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${
                                            isActive && !isExpired
                                            ? "bg-white text-black hover:bg-zinc-200" 
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed pointer-events-none"
                                        }`}
                                    >
                                        <Play className="w-3 h-3 fill-current" /> Play
                                    </Link>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-zinc-500 text-sm">
                    No challenges have been added to this contest yet.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
