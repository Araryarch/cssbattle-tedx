"use client";

import { useState } from "react";
import { Check, X, Search, User, Shield } from "lucide-react";
import { updateUserVerificationAction } from "@/lib/user-actions";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isVerified: boolean;
  role: "admin" | "user";
}

export default function UsersTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = initialUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
  );

  const handleVerification = async (userId: string, isVerified: boolean) => {
    setLoadingId(userId);
    await updateUserVerificationAction(userId, isVerified);
    // Optimistic update handled by page revalidation, 
    // but we clear loading state.
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-white/40">No users found matching "{query}"</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="glass border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{user.name || "Unknown"}</h3>
                        {user.role === 'admin' && (
                            <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Admin
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-white/40">{user.email}</p>
                    <div className="flex gap-2 mt-1 md:hidden">
                        <span
                            className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                            user.isVerified
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            )}
                        >
                            {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="hidden md:block">
                        <span
                            className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                            user.isVerified
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            )}
                        >
                            {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                    </div>
                    
                    {user.role !== 'admin' && (
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                            <button
                                onClick={() => handleVerification(user.id, true)}
                                disabled={loadingId === user.id || user.isVerified}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    user.isVerified 
                                        ? "bg-green-500 text-black shadow-lg" 
                                        : "hover:bg-green-500/20 hover:text-green-400 text-white/40"
                                )}
                                title="Approve"
                            >
                                {loadingId === user.id && !user.isVerified ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button
                                onClick={() => handleVerification(user.id, false)}
                                disabled={loadingId === user.id || !user.isVerified}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    !user.isVerified 
                                        ? "bg-red-500 text-white shadow-lg" 
                                        : "hover:bg-red-500/20 hover:text-red-400 text-white/40"
                                )}
                                title="Reject / Revoke"
                            >
                                {loadingId === user.id && user.isVerified ? (
                                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <X className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
