import { Info } from "lucide-react";
import { Challenge } from "@/lib/challenges";

interface BattleSidebarProps {
  challenge?: Challenge;
  unlockedTips: number[];
  onUnlockTip: (idx: number) => void;
}

export default function BattleSidebar({
  challenge,
  unlockedTips,
  onUnlockTip,
}: BattleSidebarProps) {
  return (
    <div className="absolute bottom-6 left-6 right-auto flex flex-col gap-2 max-w-xs z-50">
      {/* Color Palette */}
      {challenge?.colors && challenge.colors.length > 0 && (
        <div className="bg-[#0a0a0c] border border-white/10 p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Palette</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {challenge.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => navigator.clipboard.writeText(color)}
                className="group relative flex items-center justify-center w-8 h-8 border border-white/10 hover:border-white/50 transition-colors"
                style={{ backgroundColor: color }}
                title={`Copy ${color}`}
              >
                <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                  {color}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description / Image Access */}
      {(challenge?.description || challenge?.imageUrl) && (
        <div className="bg-[#0a0a0c] border border-white/10 p-3 shadow-lg flex flex-col gap-2">
          {challenge.description && (
            <div className="text-[11px] text-zinc-400 font-mono leading-relaxed">
              {challenge.description}
            </div>
          )}
          {challenge.imageUrl && (
            <a
              href={challenge.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline mt-1"
            >
              <Info className="w-3 h-3" /> View Reference Image
            </a>
          )}
        </div>
      )}

      {/* Hints / Tips */}
      {challenge?.tips && challenge.tips.length > 0 && (
        <div className="bg-[#0a0a0c] border border-white/10 p-3 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hints</span>
          </div>

          {challenge.tips.map((tip, idx) => {
            const isUnlocked = unlockedTips.includes(idx);
            return (
              <div key={idx} className="bg-white/5 border border-white/5 rounded p-2">
                {isUnlocked ? (
                  <p className="text-[11px] text-zinc-300 font-mono leading-snug">{tip}</p>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm("Revealing this hint will cost 50 points. Are you sure?")) {
                        onUnlockTip(idx);
                      }
                    }}
                    className="w-full text-left text-[10px] font-bold text-yellow-500 hover:text-yellow-400 uppercase tracking-wider flex items-center gap-2"
                  >
                    <Info className="w-3 h-3" /> Unlock Hint (-50pts)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
