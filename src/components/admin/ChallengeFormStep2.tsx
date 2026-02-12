import { useState } from "react";
import { Challenge } from "@/lib/challenges";
import { uploadChallengeImageAction } from "@/lib/actions";
import Editor from "@monaco-editor/react";
import { Code, Image as ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeFormStep2Props {
  formData: Challenge;
  setFormData: React.Dispatch<React.SetStateAction<Challenge>>;
}

export default function ChallengeFormStep2({
  formData,
  setFormData,
}: ChallengeFormStep2Props) {
  const [mode, setMode] = useState<"code" | "image">(() => {
    // Determine mode based on existing data
    if (formData.targetCode) return "code";
    if (formData.imageUrl) return "image"; // If image exists but no code, assume image mode
    return "code"; // Default
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("File must be an image");
        return;
      }

      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadChallengeImageAction(fd);
        if (result.error) throw new Error(result.error);
        if (result.publicUrl) {
          setFormData((prev) => ({ 
             ...prev, 
             imageUrl: result.publicUrl,
             targetCode: "" // clear code when uploading image
          }));
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3">
              Target (Solution)
              <span className="text-[10px] font-bold text-black bg-green-500 px-2 py-0.5 rounded uppercase tracking-widest">
                Master
              </span>
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1">
              Choose how to define the target result: via Code (HTML/CSS) or by uploading an Image.
            </p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-lg gap-1">
             <button
                type="button"
                onClick={() => setMode("code")}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                    mode === "code" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-white"
                )}
             >
                <Code className="w-3 h-3" /> Code
             </button>
             <button
                type="button"
                onClick={() => setMode("image")}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                    mode === "image" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-white"
                )}
             >
                <ImageIcon className="w-3 h-3" /> Image
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          {/* Left Column: Input (Editor or Uploader) */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0c] ring-1 ring-white/10 shadow-inner h-full flex flex-col relative">
            <div className="px-4 py-2 border-b border-white/10 bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
              <span>{mode === "code" ? "Editor" : "Image Upload"}</span>
              <span className="text-xs text-white/20">{mode === "code" ? "HTML/CSS" : "PNG/JPG"}</span>
            </div>
            
            <div className="flex-1 relative">
                {mode === "code" ? (
                    <Editor
                        height="100%"
                        defaultLanguage="html"
                        theme="vs-dark"
                        value={formData.targetCode || ""}
                        onChange={(value) => setFormData((prev) => ({ ...prev, targetCode: value || "" }))}
                        options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        fontFamily: "'JetBrains Mono', monospace",
                        wordWrap: "on",
                        lineNumbers: "on",
                        folding: false,
                        renderWhitespace: "selection",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        autoClosingBrackets: "always",
                        autoClosingOvertype: "always",
                        suggest: { showKeywords: true, showSnippets: true },
                        quickSuggestions: { other: true, comments: true, strings: true },
                        parameterHints: { enabled: true },
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                        <div className="bg-white/5 p-4 rounded-full">
                            <Upload className="w-8 h-8 text-zinc-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white mb-1">Upload Target Image</p>
                            <p className="text-xs text-zinc-500">400x300px recommended for perfect fit</p>
                        </div>
                        <label className="relative">
                             <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                             <div className={cn(
                                 "px-4 py-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer",
                                 isUploading && "opacity-50 cursor-wait"
                             )}>
                                 {isUploading ? "Uploading..." : "Select File"}
                             </div>
                        </label>
                        {formData.imageUrl && (
                            <div className="text-[10px] font-mono text-green-400 mt-2 bg-green-500/10 px-2 py-1 rounded">
                                Image Set: {formData.imageUrl.split('/').pop()}
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white shadow-inner h-full relative flex flex-col">
            <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
              <span>Preview (400x300)</span>
            </div>
            <div className="flex-1 bg-zinc-100 flex items-center justify-center p-4">
              <div className="w-[400px] h-[300px] bg-white shadow-2xl relative overflow-hidden">
                {mode === "code" || (!formData.imageUrl && formData.targetCode) ? (
                     <iframe
                        title="target-preview"
                        srcDoc={`<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:white;}</style></head><body>${formData.targetCode || ""}</body></html>`}
                        className="w-full h-full border-none"
                    />
                ) : (
                    formData.imageUrl ? (
                        <img 
                            src={formData.imageUrl} 
                            alt="Target Preview" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-50">
                            <span className="text-xs font-mono uppercase">No Preview</span>
                        </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
