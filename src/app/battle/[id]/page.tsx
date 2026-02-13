"use client";

import { useParams } from "next/navigation";
import BattleInterface from "@/components/battle/BattleInterface";

export default function BattlePage() {
  const params = useParams();
  const id = params.id as string;
  return <BattleInterface challengeId={id} />;
}
