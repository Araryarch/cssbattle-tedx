"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useLogin } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const loginMutation = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate(formData, {
      onSuccess: () => {
        router.refresh();
        router.push("/");
      },
      onError: (err: any) => {
        setError(err.response?.data?.error || err.message || "Login failed");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter uppercase">
            Tedx<span className="text-primary">CSS</span>
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">
            Enter the Arena
          </p>
        </div>

        {error && (
          <div className="p-4 text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}

      <div className="flex flex-col gap-4">
        <button
          onClick={async () => {
             await authClient.signIn.social({
                 provider: "github",
                 callbackURL: "/", // Redirect after login
             });
          }}
          className="w-full py-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Sign in with GitHub
        </button>

        <div className="flex items-center gap-4">
           <div className="h-px bg-white/10 flex-1" />
           <span className="text-zinc-500 text-[10px] uppercase font-bold">OR</span>
           <div className="h-px bg-white/10 flex-1" />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 focus:border-primary outline-none transition-colors text-sm"
                placeholder="developer@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 focus:border-primary outline-none transition-colors text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 bg-primary hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "AUTHENTICATE"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          NEW RECRUIT?{" "}
          <Link href="/register" className="text-white hover:text-primary transition-colors font-bold uppercase tracking-wider">
            REGISTER
          </Link>
        </p>
      </div>
    </div>
  );
}
