import { getUsersAction } from "@/lib/user-actions";
import { Users as UsersIcon, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UsersTable from "@/components/admin/UsersTable";

export default async function UsersManagementPage() {
  const users = await getUsersAction();

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            User Management
          </h1>
          <p className="text-zinc-400">
            Manage user access and verification status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
            <UsersIcon className="w-8 h-8 text-blue-500 mb-2 opacity-80" />
            <div>
              <span className="text-3xl font-black text-white block">{totalUsers}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Users</span>
            </div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-2 opacity-80" />
            <div>
              <span className="text-3xl font-black text-white block">{verifiedUsers}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Verified</span>
            </div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
            <ShieldCheck className="w-8 h-8 text-purple-500 mb-2 opacity-80" />
            <div>
              <span className="text-3xl font-black text-white block">{adminUsers}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Admins</span>
            </div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
            <Clock className="w-8 h-8 text-yellow-500 mb-2 opacity-80" />
            <div>
              <span className="text-3xl font-black text-white block">{totalUsers - verifiedUsers}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pending</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <UsersTable initialUsers={users} />
      </div>
    </div>
  );
}
