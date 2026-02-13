"use client";

import { useContest } from "@/lib/hooks";
import Link from "next/link";
import { Calendar, Clock, Trophy, ArrowLeft, Play, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ContestDetailsPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { data: contest, isLoading, isError } = useContest(contestId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !contest) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-zinc-500 mb-4">Contest Not Found</h1>
            <Link href="/contest" className="text-primary hover:underline">
              ← Back to Contests
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(contest.startTime);
  const endDate = new Date(contest.endTime);
  const isActive = now >= startDate && now <= endDate;
  const isEnded = now > endDate;
  const isUpcoming = now < startDate;

  const orderedChallenges = contest.challenges || [];

  return (
    <div className="min-h-screen bg-black text-white">
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header Section */}
            <div>
                <Link href="/contest" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Contests
                </Link>
                
                <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                                {contest.title}
                            </h1>
                             {isActive && (
                                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
                                    Live
                                </span>
                            )}
                        </div>
                        <p className="text-xl text-zinc-400 max-w-3xl border-l-4 border-white/10 pl-6">
                            {contest.description}
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-sm text-zinc-500 font-mono bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-primary" />
                             <span>{startDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-primary" />
                             <span>{startDate.toLocaleTimeString()} - {endDate.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Status */}
            {!isActive && !isEnded && (
                <div className="p-12 border border-blue-500/20 bg-blue-500/5 rounded-3xl text-center">
                    <h3 className="text-2xl font-bold text-blue-400 mb-2">Contest Has Not Started</h3>
                    <p className="text-zinc-400">Please wait for the designated start time to view challenges.</p>
                </div>
            )}

            {/* Challenges Grid */}
            {(isActive || isEnded) && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Challenges
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orderedChallenges.map((challenge, index) => (
                             <motion.div
                               key={challenge.id}
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ duration: 0.4, delay: index * 0.1 }}
                             >
                             <Link 
                                href={`/battle/${challenge.id}?contestId=${contest.id}`}
                                className="group block"
                             >
                                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden group-hover:bg-zinc-900 group-hover:border-primary/50 transition-all duration-300">
                                    <ChallengePreview challenge={challenge} />
                                    
                                    <div className="px-4 pb-4 pt-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {index + 1}. {challenge.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                challenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                                challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-red-500/10 text-red-500'
                                            }`}>
                                                {challenge.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                             </Link>
                             </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";

function ChallengePreview({ challenge }: { challenge: any }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.75); // Default scale

    useEffect(() => {
        if (!containerRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                // Calculate scale to fit 400px content into container width
                const newScale = width / 400;
                setScale(newScale);
            }
        });
        
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden border-b border-white/5 group-hover:border-primary/20 transition-colors">
            {challenge.imageUrl ? (
                    <img 
                    src={challenge.imageUrl} 
                    alt={challenge.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
            ) : challenge.targetCode ? (
                <div 
                    className="w-[400px] h-[300px] bg-white origin-top-left pointer-events-none select-none"
                    style={{ transform: `scale(${scale})` }}
                >
                    <iframe 
                        srcDoc={`<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${challenge.targetCode}</body></html>`}
                        className="w-full h-full border-none"
                    />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-sm">
                    No Preview
                </div>
            )}
            
            <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors" />
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 z-10">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg text-white">
                    <Play className="w-4 h-4 ml-1" />
                </div>
            </div>
        </div>
    );
}
