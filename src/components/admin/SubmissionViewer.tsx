"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { X, Code, Eye, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  userName: string | null;
  challengeTitle: string | null;
  challengeTarget: string | null;
  challengeImage: string | null;
  code: string;
  score: string;
  accuracy: string;
  duration: number | null;
  chars: number | null;
  createdAt: Date;
}

interface SubmissionViewerProps {
  submission: Submission;
  onClose: () => void;
}

export default function SubmissionViewer({
  submission,
  onClose,
}: SubmissionViewerProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");

  const previewSrc = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${submission.code}</body></html>`;
  
  const targetSrc = (() => {
      if (submission.challengeImage && !submission.challengeTarget) {
         return `<!DOCTYPE html><html><body style="margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:url('${submission.challengeImage}') no-repeat center/cover;"></body></html>`;
      }
      return `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style></head><body>${submission.challengeTarget || ""}</body></html>`;
  })();

  const formatTime = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass border border-white/10 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-zinc-400 font-normal">Submission by</span> {submission.userName || "Unknown"}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                 <Target className="w-3 h-3"/> {submission.challengeTitle || "Challenge"}
              </span>
              <span>Score: <b className="text-white">{submission.score}</b></span>
              <span>Accuracy: <b className="text-white">{submission.accuracy}%</b></span>
              <span>Chars: <b className="text-white">{submission.chars ?? submission.code.length}</b></span>
              <span>Time: <b className="text-white">{formatTime(submission.duration)}</b></span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Left: Editor/Preview switcher on mobile, split on desktop */}
            <div className="flex-1 flex flex-col border-r border-white/5 relative">
                <div className="flex border-b border-white/5">
                    <button 
                        onClick={() => setActiveTab("code")}
                        className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2", activeTab === "code" ? "bg-white/10 text-white border-b-2 border-primary" : "text-zinc-500")}
                    >
                        <Code className="w-4 h-4"/> Code
                    </button>
                    <button 
                        onClick={() => setActiveTab("preview")}
                        className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2", activeTab === "preview" ? "bg-white/10 text-white border-b-2 border-primary" : "text-zinc-500")}
                    >
                        <Eye className="w-4 h-4"/> Preview
                    </button>
                </div>
                
                <div className="flex-1 relative bg-[#1e1e1e]">
                    {/* Always render Editor but create visibility toggle */}
                    <div className={cn("absolute inset-0", activeTab === "code" ? "z-10 visible" : "z-0 invisible")}>
                         <Editor
                            height="100%"
                            defaultLanguage="html"
                            theme="vs-dark"
                            value={submission.code}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', monospace",
                                wordWrap: "on",
                                automaticLayout: true,
                            }}
                        />
                    </div>
                    
                    {/* Preview Mode */}
                     <div className={cn("absolute inset-0 bg-[#0a0a0c] flex items-center justify-center p-8 overflow-y-auto", activeTab === "preview" ? "z-10 visible" : "z-0 invisible")}>
                        <div className="flex flex-col gap-8 items-center w-full max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
                                {/* User Output */}
                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">User Output</span>
                                    <div className="w-[400px] h-[300px] bg-white rounded shadow-lg overflow-hidden relative ring-1 ring-white/10">
                                        <iframe title="preview" srcDoc={previewSrc} className="w-full h-full border-none pointer-events-none" />
                                    </div>
                                </div>
                                
                                {/* Target */}
                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target</span>
                                    <div className="w-[400px] h-[300px] bg-white rounded shadow-lg overflow-hidden relative ring-1 ring-white/10">
                                         {submission.challengeImage && !submission.challengeTarget ? (
                                            <img src={submission.challengeImage} className="w-full h-full object-cover" />
                                         ) : (
                                            <iframe title="target" srcDoc={targetSrc} className="w-full h-full border-none pointer-events-none" />
                                         )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
