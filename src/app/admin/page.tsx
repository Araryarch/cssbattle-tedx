import Link from "next/link";
import { Trophy, Users, Activity } from "lucide-react";
import LiveUserList from "@/components/LiveUserList";
import AdminDashboardStats from "@/components/AdminDashboardStats";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-400">Welcome back, Admin.</p>
      </div>

      <AdminDashboardStats />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group">
           <Link href="/admin/challenges" className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-lg">Manage Challenges</h3>
                  <p className="text-sm text-zinc-500">Create and edit coding targets</p>
              </div>
           </Link>
        </div>

        <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group">
           <Link href="/admin/contests" className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-lg">Manage Contests</h3>
                  <p className="text-sm text-zinc-500">Schedule events and assign challenges</p>
              </div>
           </Link>
        </div>

        <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group">
           <Link href="/admin/users" className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-lg">Manage Users</h3>
                  <p className="text-sm text-zinc-500">Approve registrations and manage access</p>
              </div>
           </Link>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold">Live User Activity</h2>
           <Link href="/admin/live" className="text-sm text-primary hover:underline">View Full Details</Link>
        </div>
        <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50">
           <LiveUserList limit={5} />
        </div>
      </div>
    </div>
  );
}
