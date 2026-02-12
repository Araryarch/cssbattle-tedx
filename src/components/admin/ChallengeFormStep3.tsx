"use client";

import { Challenge } from "@/lib/challenges";
import Editor from "@monaco-editor/react";

interface ChallengeFormStep3Props {
  formData: Challenge;
  setFormData: React.Dispatch<React.SetStateAction<Challenge>>;
}

export default function ChallengeFormStep3({
  formData,
  setFormData,
}: ChallengeFormStep3Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="glass border border-white/5 p-8 rounded-3xl space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-3">
            Initial Code (User Start)
            <span className="text-[10px] font-bold text-black bg-yellow-500 px-2 py-0.5 rounded uppercase tracking-widest">
              Starter
            </span>
          </h2>
          <p className="text-[11px] text-zinc-500 mt-1">
            The code provided to the user when they begin. Usually contains boilerplate.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0c] ring-1 ring-white/10 shadow-inner h-full flex flex-col">
            <div className="px-4 py-2 border-b border-white/10 bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Editor</span>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="html"
                theme="vs-dark"
                value={formData.defaultCode || ""}
                onChange={(value) => setFormData((prev) => ({ ...prev, defaultCode: value || "" }))}
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
                  suggest: { showKeywords: true, showSnippets: true },
                  quickSuggestions: { other: true, comments: true, strings: true },
                  parameterHints: { enabled: true },
                }}
              />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white shadow-inner h-full relative flex flex-col">
            <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Initial State Preview</span>
            </div>
            <div className="flex-1 bg-zinc-100 flex items-center justify-center p-4">
              <div className="w-[400px] h-[300px] bg-white shadow-2xl relative">
                <iframe
                  title="initial-preview"
                  srcDoc={`<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:white;}</style></head><body>${formData.defaultCode || ""}</body></html>`}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
