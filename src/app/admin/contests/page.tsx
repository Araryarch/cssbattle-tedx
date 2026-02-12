"use client";

import { Plus, Calendar, Clock, Edit, Trophy, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useAdminContests, useDeleteContest } from "@/lib/hooks";

export default function AdminContestsPage() {
  const { data: contestsList = [], isLoading } = useAdminContests();
  const deleteContest = useDeleteContest();

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
            <p className="text-zinc-400">Manage competitive events.</p>
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
          {contestsList.map((contest: any) => (
            <div
              key={contest.id}
              className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{contest.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    contest.isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {contest.isActive ? "Active" : "Draft"}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-zinc-400 mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(contest.startTime), "PP p")}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(contest.endTime), "PP p")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Link
                  href={`/admin/contests/leaderboard/${contest.id}`}
                  className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                  title="View Leaderboard"
                >
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </Link>
                <Link
                  href={`/admin/contests/edit/${contest.id}`}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                  <Edit className="w-3 h-3" /> Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this contest?")) {
                      deleteContest.mutate(contest.id);
                    }
                  }}
                  disabled={deleteContest.isPending}
                  className="bg-white/5 hover:bg-red-500/10 p-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors text-zinc-400 hover:text-red-400 disabled:opacity-50"
                  title="Delete contest"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {contestsList.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                <p>No contests found. Create one to get started.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
