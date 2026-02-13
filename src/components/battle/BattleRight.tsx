import { Info } from "lucide-react";
import { toast } from "sonner";
import { Challenge } from "@/lib/challenges";

interface BattleRightProps {
  challenge?: Challenge;
  unlockedTips: number[];
  onUnlockTip: (idx: number) => void;
}

export default function BattleRight({ challenge, unlockedTips, onUnlockTip }: BattleRightProps) {
  const targetSrcDoc = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${challenge?.targetCode || ""}</body></html>`;

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0a0a0c]">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Recreate this target
        </span>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            400x300
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* Target Image Component */}
        <div className="w-full aspect-[4/3] bg-zinc-900 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
            {challenge?.imageUrl ? (
              <img 
                src={challenge.imageUrl} 
                alt="Target" 
                className="w-full h-full object-cover"
              />
            ) : (
               /* Fallback for code-only targets - scaled to fit strictly (318px / 400px = 0.795) */
               <div 
                  className="w-[400px] h-[300px] origin-top-left select-none pointer-events-none"
                  style={{ transform: "scale(0.795)" }} 
               >
                  <iframe
                      title="target-frame"
                      srcDoc={targetSrcDoc}
                      className="w-full h-full border-none"
                  />
               </div>
            )}
        </div>

        {/* Hints / Tips */}
        {challenge?.tips && challenge.tips.length > 0 && (
          <div className="space-y-2">
             <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hints</span>
             </div>
             
             <div className="space-y-2">
                {challenge.tips.map((tip, idx) => {
                  const isUnlocked = unlockedTips.includes(idx);
                  // Safety check for non-string tips (e.g. database migration legacy)
                  const tipText = typeof tip === 'string' ? tip : typeof tip === 'object' ? (tip as any).content || (tip as any).text || JSON.stringify(tip) : String(tip);
                  
                  return (
                    <div key={idx} className="bg-zinc-900 border border-white/10 rounded p-2">
                      {isUnlocked ? (
                        <p className="text-[11px] text-zinc-300 font-mono leading-snug">{tipText}</p>
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
          </div>
        )}

        {/* Colors */}
        <div className="space-y-2">
             <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Colors</span>
                <span className="text-[10px] text-zinc-600 font-mono">CTRL SHIFT C</span>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {(challenge?.colors || []).map((color, idx) => {
                    const colorStr = typeof color === 'string' ? color : (color as any).value || (color as any).color || '#000000';
                    return (
                        <button
                            key={idx}
                            onClick={() => copyColor(colorStr)}
                            className="group flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full pl-1 pr-3 py-1 hover:border-white/30 transition-all active:scale-95"
                        >
                            <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: colorStr }} />
                            <span className="text-[11px] font-mono text-zinc-400 group-hover:text-white transition-colors">{colorStr}</span>
                        </button>
                    );
                })}
            </div>
        </div>
        
      </div>
    </div>
  );
}
