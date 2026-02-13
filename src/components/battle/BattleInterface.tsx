"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Code2, Eye, Info } from "lucide-react";

import ScoreModal from "@/components/ScoreModal";
import BattleSubheader from "@/components/battle/BattleSubheader";
import BattleEditor from "@/components/battle/BattleEditor";
import BattleMiddle from "@/components/battle/BattleMiddle";
import BattleRight from "@/components/battle/BattleRight";
import TestResultToast from "@/components/battle/TestResultToast";
import { useBattle } from "@/lib/hooks/useBattle";
import { useUser } from "@/components/UserProvider";

interface BattleInterfaceProps {
    challengeId: string;
    contestId?: string;
    contestStatus?: "active" | "ended" | "upcoming";
    nextChallengeId?: string | null;
    endTime?: string | Date; // Added this
}

export default function BattleInterface({ challengeId, contestId, contestStatus, nextChallengeId, endTime }: BattleInterfaceProps) {
  const { user } = useUser();

  const battle = useBattle(challengeId, user, contestId);
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "info">("editor");

  const nextChallengeUrl = contestId && nextChallengeId 
      ? `/contest/${contestId}/battle/${nextChallengeId}` 
      : nextChallengeId ? `/battle/${nextChallengeId}` : undefined;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden h-[100dvh] lg:h-auto">
      <BattleSubheader
        id={challengeId}
        challenge={battle.challenge}
        stats={battle.stats}
        isTesting={battle.isTesting}
        isSubmitting={battle.isSubmitting}
        onTest={battle.handleTest}
        onSubmit={battle.handleSubmit}
      />

      <main className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-[1fr_440px_350px]">
        {/* Editor Area */}
        <div className={cn("hidden h-full flex-col lg:flex", activeTab === "editor" && "flex")}>
          <BattleEditor
            code={battle.code}
            elapsedTime={battle.elapsedTime}
            formatTime={battle.formatTime}
            onCodeChange={battle.handleCodeChange}
            onReset={battle.resetCode}
          />
        </div>

        {/* Middle / Preview Area */}
        <div className={cn("hidden h-full flex-col lg:flex border-l border-white/5", activeTab === "preview" && "flex")}>
          <BattleMiddle
            challengeId={challengeId}
            previewDoc={battle.previewDoc}
            targetCode={battle.challenge?.targetCode}
            stats={battle.stats}
            lastScore={battle.scoreResult}
            userStats={battle.userStats}
            showTarget={battle.showTarget}
            onUnlockSolutions={battle.markAsUnlocked}
            contestId={contestId}
            contestStatus={contestStatus}
            endTime={endTime}
          />
        </div>

        {/* Right / Info Area */}
        <div className={cn("hidden h-full flex-col lg:flex border-l border-white/5", activeTab === "info" && "flex")}>
          <BattleRight
            challenge={battle.challenge}
            unlockedTips={battle.unlockedTips}
            onUnlockTip={(idx) =>
              battle.setUnlockedTips((prev) => [...prev, idx])
            }
            contestId={contestId}
          />
        </div>
      </main>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden h-16 bg-[#0a0a0c] border-t border-white/10 grid grid-cols-3 shrink-0 pb-2 z-50">
         <button
            onClick={() => setActiveTab("editor")}
            className={cn("flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase transition-all relative", activeTab === "editor" ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
         >
            {activeTab === "editor" && <div className="absolute top-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(222,41,41,0.5)]" />}
            <Code2 className="w-5 h-5" />
            Code
         </button>
         <button
            onClick={() => setActiveTab("preview")}
            className={cn("flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase transition-all relative", activeTab === "preview" ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
         >
            {activeTab === "preview" && <div className="absolute top-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(222,41,41,0.5)]" />}
            <Eye className="w-5 h-5" />
            Preview
         </button>
         <button
            onClick={() => setActiveTab("info")}
            className={cn("flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold uppercase transition-all relative", activeTab === "info" ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
         >
            {activeTab === "info" && <div className="absolute top-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(222,41,41,0.5)]" />}
            <Info className="w-5 h-5" />
            {contestId ? "Contest" : "Info"}
         </button>
      </div>

      <ScoreModal
        isOpen={battle.isModalOpen}
        onClose={() => battle.setIsModalOpen(false)}
        result={battle.scoreResult}
        nextChallengeUrl={nextChallengeUrl}
      />

      <TestResultToast
        testResult={battle.testResult}
        isModalOpen={battle.isModalOpen}
        onDismiss={() => battle.setTestResult(null)}
      />

      {/* Hidden Render Containers for html2canvas */}
      <div
        style={{
          position: "absolute",
          top: -9999,
          left: -9999,
          visibility: "visible",
        }}
      >
        <iframe
          ref={battle.hiddenUserIframeRef}
          width="400"
          height="300"
          srcDoc={battle.previewDoc}
          style={{ border: "none", overflow: "hidden" }}
        />
        <iframe
          ref={battle.hiddenTargetIframeRef}
          width="400"
          height="300"
          srcDoc={battle.targetDocSrc}
          style={{ border: "none", overflow: "hidden" }}
        />
      </div>
    </div>
  );
}
