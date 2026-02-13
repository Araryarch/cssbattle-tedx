"use client";

import { useParams, useRouter } from "next/navigation";
import BattleInterface from "@/components/battle/BattleInterface";
import { useContest } from "@/lib/hooks";

export default function ContestBattlePage() {
  const params = useParams();
  const contestId = params.id as string;
  const challengeId = params.challengeId as string;
  const router = useRouter();

  const { data: contest } = useContest(contestId);

  const now = new Date();
  const contestStatus = contest ? (
      now < new Date(contest.startTime) ? "upcoming" :
      now > new Date(contest.endTime) ? "ended" : "active"
  ) : undefined;

  const challenges = contest?.challenges || [];
  const currentIndex = challenges.findIndex((c: any) => c.id === challengeId);
  const nextChallenge = currentIndex >= 0 && currentIndex < challenges.length - 1 
      ? challenges[currentIndex + 1] 
      : null;
  const nextChallengeId = nextChallenge?.id;

  return <BattleInterface 
    challengeId={challengeId} 
    contestId={contestId} 
    contestStatus={contestStatus} 
    nextChallengeId={nextChallengeId} 
    endTime={contest?.endTime}
  />;
}
