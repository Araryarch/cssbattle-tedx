"use client";

import { Plus, Calendar, Clock, Edit, Trophy, Loader2, Trash2, Power, Play, Square, Eye, Users } from "lucide-react";
import Link from "next/link";
import { format, isPast, isFuture } from "date-fns";
import { useAdminContests, useDeleteContest } from "@/lib/hooks";
import { startContestAction, stopContestAction } from "@/lib/contest-actions";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export default function AdminContestsPage() {
  const { data: contestsList = [], isLoading, refetch } = useAdminContests();
  const deleteContest = useDeleteContest();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ id: string; type: "start" | "stop" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      if (actionModal.type === "start") {
        const res = await startContestAction(actionModal.id);
        if (res.success) {
          toast.success("Contest started successfully! It's now visible to users.");
        } else {
          toast.error(res.error || "Failed to start");
        }
      } else {
        const res = await stopContestAction(actionModal.id);
        if (res.success) {
          toast.success("Contest stopped. End time set to now.");
        } else {
          toast.error(res.error || "Failed to stop");
        }
      }
      await refetch();
    } catch (e) {
      toast.error("An error occurred");
      console.error(e);
    } finally {
      setActionLoading(false);
      setActionModal(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
       deleteContest.mutate(deleteId, {
           onSuccess: () => {
               toast.success("Contest deleted successfully");
               setDeleteId(null);
           },
           onError: (err) => {
               toast.error("Failed to delete contest");
               console.error(err);
           }
       });
    }
  };

  const getContestStatus = (contest: any) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    if (now > end) return { label: "Ended", color: "zinc", icon: "⏹" };
    if (now >= start && now <= end && contest.isActive) return { label: "Live", color: "red", icon: "🔴" };
    if (contest.isActive && now < start) return { label: "Scheduled", color: "blue", icon: "🕐" };
    if (contest.isActive) return { label: "Active", color: "green", icon: "✓" };
    return { label: "Draft", color: "zinc", icon: "📝" };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
            <p className="text-zinc-400">Manage competitive events — create, start, stop, and edit.</p>
          </div>
          <Link
            href="/admin/contests/new"
            className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Contest
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contestsList.map((contest: any) => {
            const status = getContestStatus(contest);
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            const isLive = now >= start && now <= end && contest.isActive;
            const isEnded = now > end;
            const canStart = !contest.isActive && !isEnded;
            const canStop = contest.isActive && !isEnded;

            return (
              <div
                key={contest.id}
                className={`bg-zinc-900/50 border rounded-2xl p-6 transition-colors group relative overflow-hidden ${
                  isLive ? "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]" : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Live indicator bar */}
                {isLive && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
                )}

                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold pr-2">{contest.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      status.color === "red" ? "bg-red-500/10 text-red-500 animate-pulse" :
                      status.color === "green" ? "bg-green-500/10 text-green-500" :
                      status.color === "blue" ? "bg-blue-500/10 text-blue-400" :
                      "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {status.icon} {status.label}
                  </span>
                </div>
                
                {contest.description && (
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{contest.description}</p>
                )}

                <div className="space-y-2 text-sm text-zinc-400 mb-6">
                  <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-600" />
                      <span className="font-mono text-xs">{format(new Date(contest.startTime), "PP p")}</span>
                  </div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      <span className="font-mono text-xs">{format(new Date(contest.endTime), "PP p")}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  {/* Start / Stop Row */}
                  <div className="flex gap-2">
                    {canStart && (
                      <button
                        onClick={() => setActionModal({ id: contest.id, type: "start" })}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold transition-colors border border-green-500/20"
                      >
                        <Play className="w-4 h-4" /> Start Contest
                      </button>
                    )}
                    {canStop && (
                      <button
                        onClick={() => setActionModal({ id: contest.id, type: "stop" })}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-colors border border-red-500/20"
                      >
                        <Square className="w-3.5 h-3.5" /> Stop Contest
                      </button>
                    )}
                    {isEnded && (
                      <Link
                        href={`/contest/${contest.id}/results`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-sm font-bold transition-colors border border-white/5"
                      >
                        <Eye className="w-4 h-4" /> View Results
                      </Link>
                    )}
                  </div>

                  {/* Secondary actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/contests/leaderboard/${contest.id}`}
                      className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                      title="View Leaderboard"
                    >
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    </Link>
                    <Link
                      href={`/contest/${contest.id}`}
                      className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                      title="Preview Contest Page"
                    >
                      <Eye className="w-4 h-4 text-zinc-400" />
                    </Link>
                    <Link
                      href={`/admin/contests/edit/${contest.id}`}
                      className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(contest.id)}
                      disabled={deleteContest.isPending}
                      className="bg-white/5 hover:bg-red-500/10 p-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors text-zinc-400 hover:text-red-400 disabled:opacity-50"
                      title="Delete contest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {contestsList.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                <p>No contests found. Create one to get started.</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Contest"
        description="Are you sure you want to delete this contest? All progress for users in this contest will be lost."
        confirmLabel="Delete"
        isLoading={deleteContest.isPending}
      />
      
      {/* Start/Stop Modal */}
      <ConfirmationModal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        onConfirm={handleAction}
        title={actionModal?.type === "start" ? "Start Contest" : "Stop Contest"}
        description={
          actionModal?.type === "start" 
            ? "This will make the contest visible to all users. They can join and enter the waiting room. Are you sure?"
            : "This will immediately end the contest and set the end time to now. All participants will see the results. Are you sure?"
        }
        confirmLabel={actionModal?.type === "start" ? "Start" : "Stop Now"}
        isLoading={actionLoading}
      />
    </div>
  );
}
