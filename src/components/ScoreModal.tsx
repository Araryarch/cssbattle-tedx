"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, Share2, Award } from "lucide-react";

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    chars: number;
    accuracy: number;
    score: number;
  } | null;
}

export default function ScoreModal({
  isOpen,
  onClose,
  result,
}: ScoreModalProps) {
  if (!result) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            key="modal-container"
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient" />

              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>

                <h2 className="text-3xl font-black mb-1">CONGRATS!</h2>
                <p className="text-white/40 text-sm mb-8 uppercase tracking-widest font-bold">
                  Battle Submitted Successfully
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="block text-[10px] font-bold text-white/40 uppercase mb-1">
                      Match
                    </span>
                    <span className="text-2xl font-black text-white">
                      {result.accuracy}%
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="block text-[10px] font-bold text-white/40 uppercase mb-1">
                      Chars
                    </span>
                    <span className="text-2xl font-black text-white">
                      {result.chars}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-primary text-primary-foreground rounded-2xl mb-8 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase opacity-60">
                      Your Final Score
                    </span>
                    <span className="text-4xl font-black tracking-tighter">
                      {result.score.toLocaleString()}
                    </span>
                  </div>
                  <Award className="w-12 h-12 opacity-30" />
                </div>

                <div className="flex flex-col gap-3">
                  <button className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                    NEXT CHALLENGE <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 glass border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" /> SHARE
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-white/5 text-white/60 font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .glass {
          background: rgba(15, 15, 20, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .bg-primary {
          background-color: hsl(var(--primary));
        }
        .text-primary-foreground {
          color: hsl(var(--primary-foreground));
        }
        .glow {
          box-shadow: 0 0 30px -10px hsl(var(--primary) / 0.5);
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}
