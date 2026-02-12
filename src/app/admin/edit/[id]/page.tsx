"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import ChallengeForm from "@/components/ChallengeForm";
import { Challenge } from "@/lib/challenges";
import { getChallengeAction } from "@/lib/actions";

export default function EditChallengePage() {
  const params = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (params.id) {
        try {
          const dbResult = await getChallengeAction(params.id as string);
          if (dbResult) {
            const data: Challenge = {
              id: dbResult.id,
              title: dbResult.title,
              difficulty: dbResult.difficulty as "Easy" | "Medium" | "Hard",
              colors: dbResult.colors,
              defaultCode: dbResult.defaultCode || undefined,
              targetCode: dbResult.targetCode || undefined,
              imageUrl: dbResult.imageUrl || undefined,
            };
            setChallenge(data);
          }
        } catch (e) {
          console.error("DB fetch error", e);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Challenge Not Found</h2>
          <p className="text-white/40">
            The challenge you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Edit Challenge
          </h1>
          <p className="text-white/40">Modify existing challenge properties</p>
        </div>

        <ChallengeForm initialData={challenge} mode="edit" />
      </main>
    </div>
  );
}
