import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BattlePreviewProps {
  previewDoc: string;
  targetCode?: string;
  viewMode: "overlap" | "side-by-side";
  showTarget: boolean;
  opacity: number;
  onSetViewMode: (mode: "overlap" | "side-by-side") => void;
  onSetShowTarget: (show: boolean) => void;
  onSetOpacity: (opacity: number) => void;
}

export default function BattlePreview({
  previewDoc,
  targetCode,
  viewMode,
  showTarget,
  opacity,
  onSetViewMode,
  onSetShowTarget,
  onSetOpacity,
}: BattlePreviewProps) {
  const targetSrcDoc = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${targetCode || ""}</body></html>`;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex gap-2">
          <button
            onClick={() => onSetViewMode("overlap")}
            className={cn(
              "px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all",
              viewMode === "overlap"
                ? "text-white border-b border-primary"
                : "text-zinc-500 hover:text-white",
            )}
          >
            Overlap
          </button>
          <button
            onClick={() => onSetViewMode("side-by-side")}
            className={cn(
              "px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all",
              viewMode === "side-by-side"
                ? "text-white border-b border-primary"
                : "text-zinc-500 hover:text-white",
            )}
          >
            Split
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Opacity
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => onSetOpacity(parseFloat(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>
          <button
            onClick={() => onSetShowTarget(!showTarget)}
            className={cn(
              "p-1.5 transition-all text-zinc-500 hover:text-white",
              showTarget && "text-primary hover:text-primary",
            )}
            title="Toggle Target Overlay"
          >
            {showTarget ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:20px_20px]">
        <div
          className={cn(
            "relative transition-all duration-500",
            viewMode === "overlap"
              ? "w-[400px] h-[300px] shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] border border-white/5 box-content"
              : "flex gap-8 scale-75 md:scale-90",
          )}
        >
          {viewMode === "overlap" ? (
            <>
              <iframe
                title="preview"
                srcDoc={previewDoc}
                className="w-[400px] h-[300px] border-none bg-white absolute inset-0 z-0"
              />
              <AnimatePresence>
                {showTarget && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 pointer-events-none"
                  >
                    <iframe
                      title="target-overlay"
                      srcDoc={targetSrcDoc}
                      className="w-full h-full border-none bg-transparent"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <div className="relative group">
                <span className="absolute -top-6 left-0 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Your Output
                </span>
                <iframe
                  title="preview"
                  srcDoc={previewDoc}
                  className="w-[400px] h-[300px] border border-white/10 bg-white overflow-hidden shadow-2xl"
                />
              </div>
              <div className="relative group">
                <span className="absolute -top-6 left-0 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Target
                </span>
                <div className="w-[400px] h-[300px] border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl">
                  <iframe
                    title="target-frame"
                    srcDoc={targetSrcDoc}
                    className="w-full h-full border-none bg-white"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
