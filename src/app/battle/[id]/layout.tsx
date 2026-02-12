"use client";

import { X } from "lucide-react";
import Link from "next/link";

export default function BattleWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-[#050505] overflow-hidden flex flex-col">
      {/* Custom Header for Workspace */}
      <div className="h-12 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/battle"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="font-black text-primary text-xl">⚡</span>
            </div>
            <span className="font-bold text-sm uppercase tracking-wider hidden md:block">
              TEDxCSS
            </span>
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2 hidden md:block" />
          <nav className="flex items-center gap-1">
            <Link
              href="/battle"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Challenges
            </Link>
          </nav>
        </div>

        <Link
          href="/battle"
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>

      {children}
    </div>
  );
}
