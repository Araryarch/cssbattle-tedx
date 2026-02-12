import { Zap } from "lucide-react";
import LiveUserList from "@/components/LiveUserList";

export default function LiveActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live User Activity
        </h1>
        <p className="text-zinc-400">Monitor contestants in real-time.</p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
         <LiveUserList />
      </div>
    </div>
  );
}
