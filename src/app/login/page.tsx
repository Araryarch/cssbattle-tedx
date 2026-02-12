"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/lib/hooks";

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
