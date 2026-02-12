"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRegister } from "@/lib/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    registerMutation.mutate(formData, {
      onSuccess: () => {
        router.push(`/login?registered=true`);
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Something went wrong. Please check your connection."
        );
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter uppercase">
            Start <span className="text-primary">Battling</span>
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">
            Create your identity
          </p>
        </div>

        {error && (
          <div className="p-4 text-xs font-mono text-center text-red-500 bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Codename
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 focus:border-primary outline-none transition-colors text-sm"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
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
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Password
              </label>
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
            disabled={registerMutation.isPending}
            className="w-full py-3 bg-primary hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "INITIATE"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          ALREADY REGISTERED?{" "}
          <Link href="/login" className="text-white hover:text-primary transition-colors font-bold uppercase tracking-wider">
            LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}
