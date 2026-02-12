"use client";

import { motion } from "framer-motion";
import { Zap, Users, Code2 } from "lucide-react";
import Link from "next/link";

interface ChallengeCardProps {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  players: number;
  previewUrl: string;
}

export default function ChallengeCard({ id, title, difficulty, players, previewUrl }: ChallengeCardProps) {
  const difficultyColor = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  }[difficulty];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-zinc-900 border border-white/10 overflow-hidden hover:border-primary transition-all duration-300"
    >
      <Link href={`/battle/${id}`} className="absolute inset-0 z-10" />
      
      {/* Preview Area */}
      <div className="aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden border-b border-white/5">
        <div 
          className="w-full h-full bg-contain bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${previewUrl})` }}
        />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 text-[10px] font-bold tracking-wider uppercase bg-black/50 backdrop-blur-sm border border-white/10 ${difficultyColor}`}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors tracking-tight">{title}</h3>
          <span className="text-xs opacity-40 font-mono">#{id}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
           <div className="flex items-center gap-2 text-xs text-zinc-500">
             <Users className="w-3 h-3" />
             <span>{players.toLocaleString()}</span>
           </div>
           
           <button className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-primary transition-colors uppercase tracking-widest">
             Play <Zap className="w-3 h-3 fill-current" />
           </button>
        </div>
      </div>
    </motion.div>
  );
}
