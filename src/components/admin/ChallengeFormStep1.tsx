"use client";

import { Challenge } from "@/lib/challenges";
import Editor from "@monaco-editor/react";

interface ChallengeFormStep1Props {
  formData: Challenge;
  setFormData: React.Dispatch<React.SetStateAction<Challenge>>;
  colorInput: string;
  setColorInput: (val: string) => void;
  onAddColor: () => void;
  onRemoveColor: (idx: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export default function ChallengeFormStep1({
  formData,
  setFormData,
  colorInput,
  setColorInput,
  onAddColor,
  onRemoveColor,
  onFileSelect,
  isUploading,
}: ChallengeFormStep1Props) {
  // Lucide icons used inline
  const Plus = require("lucide-react").Plus;
  const X = require("lucide-react").X;
  const Palette = require("lucide-react").Palette;
  const Upload = require("lucide-react").Upload;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="space-y-6">
        <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Challenge ID
            </label>
            <input
              type="text"
              value={formData.id}
              disabled={true}
              placeholder="Auto-generated UUID"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors disabled:opacity-50 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Square Hole"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Challenge instructions..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors resize-none h-24"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Hints / Tips (Unlocking reduces score)
            </label>
            <div className="space-y-2">
              {(formData.tips || []).map((tip, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={tip}
                    onChange={(e) => {
                      const newTips = [...(formData.tips || [])];
                      newTips[idx] = e.target.value;
                      setFormData({ ...formData, tips: newTips });
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTips = (formData.tips || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, tips: newTips });
                    }}
                    className="p-2 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tips: [...(formData.tips || []), ""] })}
                className="text-xs text-primary font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Tip
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: d })}
                  className={`py-3 rounded-xl border font-bold text-xs transition-all uppercase tracking-wider ${
                    formData.difficulty === d
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Target Max Chars (for Golf Bonus)
            </label>
            <input
              type="number"
              value={formData.targetChars || 200}
              onChange={(e) =>
                setFormData({ ...formData, targetChars: parseInt(e.target.value) || 200 })
              }
              placeholder="e.g. 200"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors font-mono"
            />
            <p className="text-[10px] text-zinc-500">
              If user code length is ≤ this value, they get full 400 bonus points (if accuracy &gt; 99.5%).
            </p>
          </div>
        </div>

        <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Technical Specs</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Canvas Width</span>
                <span className="text-xl font-mono text-white">400px</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Canvas Height</span>
                <span className="text-xl font-mono text-white">300px</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <h3 className="font-bold text-white mb-1">
                  {!formData.isHidden ? "Published & Visible" : "Hidden (Draft)"}
                </h3>
                <p className="text-xs text-zinc-500">
                  {!formData.isHidden ? "Visible to all users." : "Only admins allow."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isHidden: !formData.isHidden })}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative ${
                  !formData.isHidden ? "bg-green-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-200 ${
                    !formData.isHidden ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Config: Colors
            </label>
            <div className="flex flex-wrap gap-2 mb-4 bg-black/20 p-4 rounded-xl min-h-[60px] border border-white/5">
              {(formData.colors || []).map((color, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-full animate-in zoom-in duration-200"
                >
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-mono">{color}</span>
                  <button type="button" onClick={() => onRemoveColor(index)} className="text-white/40 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(formData.colors || []).length === 0 && (
                <span className="text-xs text-zinc-600 italic self-center">No colors added yet.</span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: colorInput || "transparent" }} />
                </div>
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="#HEXCOLOR"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 text-sm font-mono uppercase"
                />
              </div>
              <div className="relative">
                <input
                  type="color"
                  value={colorInput.padEnd(7, "F")}
                  onChange={(e) => setColorInput(e.target.value.toUpperCase())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button type="button" className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors h-full flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <button type="button" onClick={onAddColor} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Optional: Reference Image
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isUploading}
              />
              {formData.imageUrl ? (
                <div className="relative z-0">
                  <img src={formData.imageUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-widest">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full" />
                    ) : (
                      <Upload className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">Click to upload reference image</p>
                  <p className="text-[10px] text-zinc-600">Max 5MB, PNG/JPG</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
