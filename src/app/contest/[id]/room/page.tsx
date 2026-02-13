"use client";

import { useContest, useCurrentUser } from "@/lib/hooks";
import { getContestParticipantsAction } from "@/lib/contest-actions";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  Trophy,
  Loader2,
  Zap,
  Shield,
  Swords,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: Date) {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isReady: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isReady: false,
  };
}

export default function ContestRoomPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { data: contest, isLoading } = useContest(contestId);
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  const fetchParticipants = useCallback(async () => {
    if (!contestId) return;
    const result = await getContestParticipantsAction(contestId);
    setParticipants(result);
    setLoadingParticipants(false);
  }, [contestId]);

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchParticipants]);

  const startDate = contest ? new Date(contest.startTime) : new Date();
  const endDate = contest ? new Date(contest.endTime) : new Date();
  const countdown = useCountdown(startDate);

  // Auto-redirect when contest starts
  useEffect(() => {
    if (countdown.isReady && contest) {
      const now = new Date();
      if (now >= new Date(contest.startTime) && now <= new Date(contest.endTime)) {
        router.push(`/contest/${contestId}`);
      }
    }
  }, [countdown.isReady, contest, contestId, router]);

  const isJoined = (contest as any)?.isJoined;
  const isEnded = contest ? new Date() > endDate : false;
  const isActive = contest ? new Date() >= startDate && new Date() <= endDate : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!contest) {
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

  // If contest is active or ended, redirect to main contest page
  if (isActive || isEnded) {
    router.push(`/contest/${contestId}`);
    return null;
  }

  // If not joined, redirect to contest detail page to join first
  if (!isJoined) {
    router.push(`/contest/${contestId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <main className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href={`/contest/${contestId}`}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Contest
          </Link>

          {/* Room Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-bold uppercase tracking-widest mb-6">
              <Shield className="w-3.5 h-3.5" />
              Waiting Room
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
              {contest.title}
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              {contest.description || "Get ready! The contest is about to begin."}
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Contest Starts In
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto">
              {[
                { value: countdown.days, label: "Days" },
                { value: countdown.hours, label: "Hours" },
                { value: countdown.minutes, label: "Minutes" },
                { value: countdown.seconds, label: "Seconds" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className="relative group"
                >
                  <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 md:p-6 text-center backdrop-blur-sm group-hover:border-primary/30 transition-all">
                    <div className="text-3xl md:text-5xl font-black font-mono text-white mb-1 tabular-nums">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      {item.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {countdown.isReady && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-bold animate-pulse">
                  <Zap className="w-5 h-5" />
                  Contest is starting! Redirecting...
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Participants Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-zinc-400" />
                Players Ready
              </h3>
              <span className="text-xs font-mono text-zinc-500 bg-white/5 px-3 py-1 rounded-full">
                {participants.length} joined
              </span>
            </div>

            <div className="p-5">
              {loadingParticipants ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-zinc-600">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Waiting for players to join...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {participants.map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          p.id === user?.id
                            ? "bg-primary/10 border-primary/20"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-zinc-300">
                              {p.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-zinc-200 truncate">
                            {p.name || "Anonymous"}
                            {p.id === user?.id && (
                              <span className="ml-1.5 text-[9px] text-primary font-bold uppercase tracking-wider">(You)</span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-600 font-mono">
                            {p.rank || "8flex"}
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tips section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-zinc-900/30 border border-white/5 rounded-2xl p-6"
          >
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Swords className="w-3.5 h-3.5" />
              Battle Tips
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">01</span>
                <span>Write your HTML/CSS code to match the target image as closely as possible.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">02</span>
                <span>Shorter code gets bonus points — optimize your character count!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">03</span>
                <span>You can submit multiple times. Only your best score counts.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">04</span>
                <span>Focus on accuracy first (pixel-perfect match), then optimize code length.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
