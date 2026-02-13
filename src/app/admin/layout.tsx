"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Users, LogOut, Flag, Zap, Eye, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/lib/hooks/useAuth";
import AdminGuard from "@/components/AdminGuard";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Challenges",
    href: "/admin/challenges",
    icon: Trophy,
  },
  {
    title: "Contests",
    href: "/admin/contests",
    icon: Flag,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Live Monitor",
    href: "/admin/live",
    icon: Zap,
  },
  {
    title: "Spectate",
    href: "/admin/spectate",
    icon: Eye,
  },
  {
    title: "Submissions",
    href: "/admin/submissions",
    icon: FileCode,
  },
  {
    title: "Certificates",
    href: "/admin/certificates",
    icon: Trophy, // Reusing Trophy or Medal if imported. Trophy is imported. 
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <AdminGuard>
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-900/50 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="inline-block">
            <span className="font-black text-xl tracking-tight">
              Style<span className="text-red-500">Wars</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-500/10 text-red-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button
             onClick={() => {
                 logoutMutation.mutate(undefined, {
                   onSuccess: () => { window.location.href = "/login"; },
                 });
             }}
             className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
           >
             <LogOut className="w-5 h-5" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8">
            {children}
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
