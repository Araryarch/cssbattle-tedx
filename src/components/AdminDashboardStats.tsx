"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Trophy, Users, Activity } from "lucide-react";

type AdminStats = {
  challengesCount: number;
  usersCount: number;
  submissionsCount: number;
};

export default function AdminDashboardStats() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-white/5 bg-zinc-900/50 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/5" />
              <div className="space-y-2">
                <div className="w-20 h-4 bg-white/5 rounded" />
                <div className="w-12 h-8 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = data || { challengesCount: 0, usersCount: 0, submissionsCount: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium">Total Challenges</p>
            <h3 className="text-2xl font-bold">{stats.challengesCount}</h3>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium">Total Users</p>
            <h3 className="text-2xl font-bold">{stats.usersCount}</h3>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium">Total Submissions</p>
            <h3 className="text-2xl font-bold">{stats.submissionsCount}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
