"use client";


import ChallengeCard from "@/components/ChallengeCard";
import { motion } from "framer-motion";
import { Zap, Trophy, Flame, ChevronRight, Loader2 } from "lucide-react";
import { useChallenges, useHomepageStats } from "@/lib/hooks";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: challenges = [], isLoading: challengesLoading } =
    useChallenges();
  const { data: stats, isLoading: statsLoading } = useHomepageStats();
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    if (!stats?.activeContest) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(stats.activeContest!.endTime).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft("ENDED");
        clearInterval(timer);
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [stats]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">


      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border-l-2 border-primary mb-10">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Engineering Challenge HTML/CSS
                </span>
              </div>

              <h1 className="text-7xl md:text-9xl font-bold mb-8 tracking-tighter leading-[0.9] text-white">
                CODE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">
                  PERFECTION
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mb-12 leading-relaxed font-light">
                Replicate targets with pixel-perfect precision.
                <span className="text-white font-medium">
                  {" "}
                  The ultimate test of CSS mastery.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="#contest"
                  className="px-12 py-5 bg-primary hover:bg-red-600 text-white font-bold text-sm tracking-widest transition-all uppercase hover:scale-105 active:scale-95"
                >
                  Start Coding
                </a>
                <Link
                  href="/contest"
                  className="px-12 py-5 border border-white/10 hover:border-white/30 text-white font-bold text-sm tracking-widest hover:bg-white/5 transition-all uppercase"
                >
                  View Contests
                </Link>
              </div>
            </motion.div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-primary/5 to-transparent opacity-50 blur-3xl pointer-events-none" />
        </section>

        {/* Contest Section */}
        <section id="contest" className="max-w-7xl mx-auto px-6 py-32">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-3 h-3 rounded-full shadow-[0_0_10px_theme(colors.red.500)] ${stats?.activeContest ? "bg-red-500 animate-pulse" : "bg-zinc-700"}`}
                />
                <span
                  className={`${stats?.activeContest ? "text-red-500" : "text-zinc-500"} font-bold tracking-widest uppercase text-sm`}
                >
                  {stats?.activeContest ? "Live Contest" : "Battle Arena"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                {stats?.activeContest
                  ? stats.activeContest.title
                  : "Practice Arena"}
              </h2>
              <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
                {stats?.activeContest
                  ? "Compete against others in real-time. Solve targets, earn points, and climb the leaderboard before time runs out."
                  : "Hone your skills with these practice challenges anytime."}
              </p>
            </div>

            <div className="flex items-center gap-6 p-6 border border-white/10 rounded-2xl bg-zinc-900/50 backdrop-blur-sm">
              {stats?.activeContest && (
                <>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                      Time Remaining
                    </p>
                    <div className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight">
                      {timeLeft}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                </>
              )}
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Top Score
                </p>
                <div className="font-mono text-3xl font-bold text-primary tabular-nums tracking-tight">
                  {stats ? stats.topScore : "---"}
                  <span className="text-sm ml-1 text-white/40">pts</span>
                </div>
              </div>
            </div>
          </div>

          {challengesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {challenges.map((challenge, idx) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <ChallengeCard {...challenge} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
              <p className="text-zinc-500 uppercase tracking-widest">
                No visible challenges
              </p>
            </div>
          )}
        </section>
      </main>


    </div>
  );
}
