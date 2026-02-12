"use client";

import Link from "next/link";
import { Zap, User, Search, LogOut, Settings } from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLogout } from "@/lib/hooks";

export default function Navbar() {
  const { user, loading } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const logoutMutation = useLogout();

  return (
    <header className="h-16 border-b border-white/10 bg-black sticky top-0 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">
              TEDx<span className="text-primary">CSS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/battle"
              className="text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider"
            >
              Battle
            </Link>
            <Link
              href="/contest"
              className="text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider"
            >
              Contest
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider"
            >
              Leaderboard
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wider"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-60 hover:opacity-100">
            <Search className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all focus:outline-none"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs font-medium text-white/50 truncate">
                          {user.email}
                        </p>
                        <p className="text-sm font-bold text-white truncate">
                          {user.name}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-300 hover:text-white hover:bg-purple-500/20 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                            logoutMutation.mutate(undefined, {
                              onSuccess: () => window.location.reload(),
                            });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-bold transition-all border border-primary/20 group"
            >
              <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
              SIGN IN
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
