"use client";

import Header from "@/components/Header";
import ChallengeForm from "@/components/ChallengeForm";

export default function NewChallenge() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2">Create New Challenge</h1>
          <p className="text-white/40">Design a new CSS task for your users</p>
        </div>

        <ChallengeForm mode="create" />
      </main>
    </div>
  );
}
