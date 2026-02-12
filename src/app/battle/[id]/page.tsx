"use client";

import { useParams } from "next/navigation";

import ScoreModal from "@/components/ScoreModal";
import BattleSubheader from "@/components/battle/BattleSubheader";
import BattleEditor from "@/components/battle/BattleEditor";
import BattleMiddle from "@/components/battle/BattleMiddle";
import BattleRight from "@/components/battle/BattleRight";
import TestResultToast from "@/components/battle/TestResultToast";
import { useBattle } from "@/lib/hooks/useBattle";
import { useUser } from "@/components/UserProvider";

export default function BattlePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();

  const battle = useBattle(id, user);

  return (
    <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
      <BattleSubheader
        id={id}
        challenge={battle.challenge}
        stats={battle.stats}
        isTesting={battle.isTesting}
        isSubmitting={battle.isSubmitting}
        onTest={battle.handleTest}
        onSubmit={battle.handleSubmit}
      />

      <main className="flex-1 overflow-hidden grid grid-cols-[1fr_440px_350px] lg:grid-cols-[1fr_440px_350px]">
        <BattleEditor
          code={battle.code}
          elapsedTime={battle.elapsedTime}
          formatTime={battle.formatTime}
          onCodeChange={battle.handleCodeChange}
          onReset={battle.resetCode}
        />

        <BattleMiddle
          challengeId={id}
          previewDoc={battle.previewDoc}
          targetCode={battle.challenge?.targetCode}
          stats={battle.stats}
          lastScore={battle.scoreResult}
          userStats={battle.userStats}
          showTarget={battle.showTarget}
        />

        <BattleRight
          challenge={battle.challenge}
          unlockedTips={battle.unlockedTips}
          onUnlockTip={(idx) =>
            battle.setUnlockedTips((prev) => [...prev, idx])
          }
        />
      </main>

      <ScoreModal
        isOpen={battle.isModalOpen}
        onClose={() => battle.setIsModalOpen(false)}
        result={battle.scoreResult}
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
