"use client";

import { useParams } from "next/navigation";
import ContestLeaderboard from "@/components/contest/ContestLeaderboard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ContestLeaderboardPage() {
    const params = useParams();
    const contestId = params.id as string;

    return (
        <div className="min-h-screen bg-black text-white p-6">
             <div className="max-w-4xl mx-auto mb-6">
                <Link href={`/contest/${contestId}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Contest
                </Link>
             </div>
             
             <div className="h-[80vh]">
                <ContestLeaderboard contestId={contestId} variant="full" />
             </div>
        </div>
    );
}
