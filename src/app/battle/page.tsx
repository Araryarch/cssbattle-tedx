"use client";

import ChallengeCard from "@/components/ChallengeCard";
import { motion } from "framer-motion";
import { useChallenges } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

export default function BattleIndexPage() {
  const { data: challenges = [], isLoading, isError } = useChallenges();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
              Battle <span className="text-primary">Arena</span>
            </h1>
            <p className="text-zinc-500 mt-2">
              Pick a challenge below to start battling.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center border border-red-500/20 rounded-xl bg-red-500/5">
            <p className="text-red-400 font-bold">Failed to load challenges</p>
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, idx) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <ChallengeCard {...challenge} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
            <p className="text-zinc-500 uppercase tracking-widest">
              No challenges available
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
