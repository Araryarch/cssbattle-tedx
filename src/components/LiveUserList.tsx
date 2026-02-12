"use client";

import { useLiveUsers } from "@/lib/hooks";

export default function LiveUserList({ limit }: { limit?: number }) {
  const { data: activeUsers = [], isLoading } = useLiveUsers();

  if (isLoading) return <div className="text-zinc-500 text-sm animate-pulse">Loading live activity...</div>;

  if (activeUsers.length === 0) {
      return (
        <div className="text-center text-zinc-500 py-4">
            <p>No recent activity detected.</p>
        </div>
      );
  }

  const displayUsers = limit ? activeUsers.slice(0, limit) : activeUsers;

  return (
    <div className="space-y-4">
        {displayUsers.map(user => (
            <div key={user.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {user.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">
                            {new Date(user.lastActive).toLocaleTimeString()}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">
                        {user.status === 'submitted' ? (
                            <span className="text-green-500">Submitted solution for</span>
                        ) : (
                            <span className="text-yellow-500">Working on</span>
                        )}
                        {" "}
                        <span className="text-zinc-400">{user.currentChallenge}</span>
                    </p>
                </div>
            </div>
        ))}
    </div>
  );
}
