import { motion, AnimatePresence } from "framer-motion";
import { ScoreResult } from "@/lib/scoring";

interface TestResultToastProps {
  testResult: ScoreResult | null;
  isModalOpen: boolean;
  onDismiss: () => void;
}

export default function TestResultToast({
  testResult,
  isModalOpen,
  onDismiss,
}: TestResultToastProps) {
  return (
    <AnimatePresence>
      {testResult && !isModalOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 bg-zinc-900 border border-white/10 p-4 rounded-lg shadow-xl max-w-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Test Result</span>
            <button
              onClick={onDismiss}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{testResult.chars}</div>
              <div className="text-[10px] text-zinc-500 uppercase">Chars</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{testResult.accuracy}%</div>
              <div className="text-[10px] text-zinc-500 uppercase">Accuracy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">{testResult.score}</div>
              <div className="text-[10px] text-zinc-500 uppercase">Score</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
