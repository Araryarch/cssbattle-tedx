"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllSubmissionsAction } from "@/lib/submission-actions";
import { Loader2, Eye, ChevronLeft, ChevronRight, Hash, Clock, Target } from "lucide-react";
import SubmissionViewer from "@/components/admin/SubmissionViewer";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  challengeId: string | null;
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

function SubmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await getAllSubmissionsAction(page);
        setSubmissions(result.data.map(d => ({
            ...d,
            createdAt: new Date(d.createdAt)
        })));
        setTotal(result.total);
        setTotalPages(result.totalPages || 1);
      } catch (error) {
        console.error("Failed to load submissions", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/admin/submissions?page=${newPage}`);
    }
  };

  const formatTime = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
             Submissions
           </h1>
           <p className="text-zinc-500 text-sm mt-1">Review user submissions, code, and previews.</p>
        </div>
        <div className="text-xs text-zinc-500 font-mono">
            Total: {total}
        </div>
      </div>

      <div className="glass border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
             <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="text-xs uppercase bg-white/5 text-zinc-500 font-bold tracking-wider border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Challenge</th>
                            <th className="px-6 py-4 text-center">Stats</th>
                            <th className="px-6 py-4 text-right">Time</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 italic">No submissions found.</td>
                            </tr>
                        ) : (
                            submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{sub.userName || "Unknown"}</span>
                                            <span className="text-xs text-zinc-600 font-mono">{sub.userEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {sub.challengeImage && <img src={sub.challengeImage} className="w-6 h-6 rounded object-cover border border-white/10" />}
                                            <span className="text-zinc-300">{sub.challengeTitle || "Untitled"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-4 text-xs font-mono">
                                            <div className="flex items-center gap-1 text-yellow-500" title="Score">
                                                <span className="font-bold">{sub.score}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-blue-400" title="Accuracy">
                                                <Target className="w-3 h-3"/> {sub.accuracy}%
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-400" title="Chars">
                                                <Hash className="w-3 h-3"/> {sub.chars ?? sub.code.length}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 text-xs font-mono text-zinc-500">
                                            <Clock className="w-3 h-3"/> {formatTime(sub.duration)}
                                        </div>
                                        <div className="text-[10px] text-zinc-600 mt-1">{sub.createdAt.toLocaleDateString()} {sub.createdAt.toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedSubmission(sub)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors border border-white/5 hover:border-white/10"
                                        >
                                            <Eye className="w-3 h-3" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/5">
            <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-xs font-mono text-zinc-500">Page {page} of {totalPages}</span>
            <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-4 h-4 text-white" />
            </button>
        </div>
      </div>

      {selectedSubmission && (
        <SubmissionViewer 
            submission={selectedSubmission} 
            onClose={() => setSelectedSubmission(null)} 
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SubmissionsContent />
    </Suspense>
  );
}
