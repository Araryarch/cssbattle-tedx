import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { calculateFinalScore, comparePixels, ScoreResult } from "@/lib/scoring";
import { Challenge } from "@/lib/challenges";
import { getChallengeAction, saveSubmissionAction } from "@/lib/actions";
import { getUserChallengeStatsAction } from "@/lib/submission-actions";
import { toast } from "sonner";

export interface ChallengeStats {
  avgAccuracy: string;
  avgChars: number;
  avgDuration: number; // New duration
  topScore: number;
  totalSubmissions: number;
}

const DEFAULT_CODE = `<div></div>
<style>
  div {
    width: 100px;
    height: 100px;
    background: #dd6b4d;
  }
</style>

<!-- OBJECTIVE -->
<!-- Write HTML/CSS in this editor and replicate the given target image in the least code possible. What you write here, renders as it is -->

<!-- SCORING -->
<!-- The score is calculated based on the number of characters you use (this comment included :P) and how close you replicate the image. -->

<!-- IMPORTANT: remove the comments before submitting -->`;

export function useBattle(id: string, user: { id?: string; name?: string | null } | null) {
  // --- Core State ---
  const [challenge, setChallenge] = useState<Challenge | undefined>(undefined);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [code, setCode] = useState("");
  const [showTarget, setShowTarget] = useState(false);
  const [opacity, setOpacity] = useState(0.5);
  const [viewMode, setViewMode] = useState<"overlap" | "side-by-side">("overlap");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ScoreResult | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [unlockedTips, setUnlockedTips] = useState<number[]>([]);
  const [userStats, setUserStats] = useState<{
    best: { score: number; accuracy: number; chars: number; duration: number } | null;
    latest: { score: number; accuracy: number; chars: number; duration: number } | null;
  } | null>(null);

  // --- Refs ---
  const hiddenUserIframeRef = useRef<HTMLIFrameElement>(null);
  const hiddenTargetIframeRef = useRef<HTMLIFrameElement>(null);

  // --- Live Code Broadcasting ---
  const broadcastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const broadcastCode = useCallback(
    (currentCode: string) => {
      if (!user?.id || !id) return;
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);

      broadcastTimerRef.current = setTimeout(() => {
        fetch("/api/live-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name || "Anonymous",
            challengeId: id,
            challengeTitle: challenge?.title || `Challenge #${id}`,
            code: currentCode,
          }),
        }).catch(() => {});
      }, 500);
    },
    [user?.id, user?.name, id, challenge?.title],
  );

  // Cleanup broadcast timer
  useEffect(() => {
    return () => {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };
  }, []);

  // --- Timer ---
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Capture & Compare ---
  const captureAndCompare = async (isSubmission: boolean) => {
    if (isSubmission) setIsSubmitting(true);
    else setIsTesting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      if (!hiddenUserIframeRef.current || !hiddenTargetIframeRef.current) {
        throw new Error("Hidden containers not found");
      }

      const userDoc = hiddenUserIframeRef.current.contentDocument;
      const targetDoc = hiddenTargetIframeRef.current.contentDocument;
      if (!userDoc || !targetDoc) throw new Error("Iframe documents not accessible");

      await new Promise((r) => setTimeout(r, 100));

      const [userCanvas, targetCanvas] = await Promise.all([
        html2canvas(userDoc.documentElement, {
          width: 400, height: 300, scale: 1, useCORS: true, logging: false, backgroundColor: null,
        }),
        html2canvas(targetDoc.documentElement, {
          width: 400, height: 300, scale: 1, useCORS: true, logging: false, backgroundColor: null,
        }),
      ]);

      const userCtx = userCanvas.getContext("2d");
      const targetCtx = targetCanvas.getContext("2d");
      if (!userCtx || !targetCtx) throw new Error("Could not get canvas context");

      const userData = userCtx.getImageData(0, 0, 400, 300);
      const targetData = targetCtx.getImageData(0, 0, 400, 300);

      const accuracy = comparePixels(userData, targetData);
      const charCount = code.length;
      const score = calculateFinalScore(charCount, accuracy, unlockedTips.length, challenge?.targetChars);

      const result: ScoreResult = {
        chars: charCount,
        accuracy: Math.round(accuracy * 100) / 100,
        score,
      };

      if (isSubmission) {
        setScoreResult(result);
        setIsModalOpen(true);
        if (user?.id) {
          await saveSubmissionAction({
            challengeId: id,
            code,
            accuracy: result.accuracy,
            score,
            duration: elapsedTime,
          });
          // Refresh stats immediately
          getUserChallengeStatsAction(id).then(stats => {
             if (stats) setUserStats(stats);
          });
        }
        setStartTime(Date.now());
      } else {
        setTestResult(result);
      }
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to capture status. Please try again.");
    } finally {
      if (isSubmission) setIsSubmitting(false);
      else setIsTesting(false);
    }
  };

  const handleTest = () => captureAndCompare(false);
  const handleSubmit = () => captureAndCompare(true);

  // --- Load Challenge Data ---
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!id) return;
      let data: Challenge | null = null;
      try {
        const dbResult = await getChallengeAction(id);
        if (dbResult) {
          data = {
            id: dbResult.id,
            title: dbResult.title,
            difficulty: dbResult.difficulty as "Easy" | "Medium" | "Hard",
            colors: dbResult.colors,
            defaultCode: dbResult.defaultCode || undefined,
            targetCode: dbResult.targetCode || undefined,
            imageUrl: dbResult.imageUrl || undefined,
            description: dbResult.description || undefined,
            tips: dbResult.tips || [],
            targetChars: dbResult.targetChars || 200,
          };
          if ((dbResult as any).stats) {
            setStats((dbResult as any).stats);
          }
        }
      } catch (e) {
        console.error("Failed to fetch from DB", e);
      }

      if (data) {
        setChallenge(data);
        if (data.defaultCode) setCode(data.defaultCode);
      }

      if (!data?.defaultCode) {
        setCode(DEFAULT_CODE);
      }
    };

    loadChallengeData();

    // Load User High Score & Latest
    if (user?.id) {
        getUserChallengeStatsAction(id).then((stats) => {
            if (stats) {
                 setUserStats(stats);
            }
        });
    }
  }, [id, user?.id]);

  // --- Memos ---
  const previewDoc = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html { margin: 0; padding: 0; width: 400px; height: 300px; overflow: hidden; background: white; }
        </style>
      </head>
      <body>${code}</body>
    </html>`,
    [code],
  );

  const targetDocSrc = useMemo(
    () => {
      if (challenge?.imageUrl && !challenge.targetCode) {
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style>
            </head>
            <body>
              <img src="${challenge.imageUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </body>
          </html>`;
      }
      return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style>
      </head>
      <body>${challenge?.targetCode || ""}</body>
    </html>`;
    },
    [challenge?.targetCode, challenge?.imageUrl],
  );

  // --- Code Change Handler ---
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || "";
      setCode(newCode);
      broadcastCode(newCode);
    },
    [broadcastCode],
  );

  const resetCode = useCallback(() => {
    setCode(challenge?.defaultCode || "");
  }, [challenge?.defaultCode]);

  return {
    // State
    challenge, stats, code, showTarget, opacity, viewMode,
    scoreResult, isModalOpen, isSubmitting, isTesting,
    testResult, elapsedTime, unlockedTips, userStats,

    // Setters
    setShowTarget, setOpacity, setViewMode,
    setIsModalOpen, setTestResult, setUnlockedTips,

    // Handlers
    handleTest, handleSubmit, handleCodeChange, resetCode, formatTime,

    // Memos
    previewDoc, targetDocSrc,

    // Refs (for hidden iframes)
    hiddenUserIframeRef, hiddenTargetIframeRef,
  };
}
