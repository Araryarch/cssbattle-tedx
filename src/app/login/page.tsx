"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />
      <div className="absolute w-full h-full bg-[url('/grid.svg')] opacity-20" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8 group">
             <span className="font-black text-4xl tracking-tight text-white group-hover:scale-105 transition-transform block">
               Style<span className="text-primary">Wars</span>
             </span>
          </Link>
          <h1 className="text-xl font-bold text-white uppercase tracking-widest mb-2">
            Combat Ready?
          </h1>
          <p className="text-zinc-500 text-sm">
            Sign in to sync your progress and join the leaderboard.
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="space-y-4">
            <button
              onClick={async () => {
                 await authClient.signIn.social({
                     provider: "github",
                     callbackURL: "/", // Redirect after login
                 });
              }}
              className="w-full py-4 bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-lg group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
           By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
