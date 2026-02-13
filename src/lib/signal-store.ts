import { db } from "@/db";
import { voiceSignals } from "@/db/schema";
import { eq, and, gt, or, isNull } from "drizzle-orm";

// In-memory version removed. Now using DB for persistence across serverless functions.

export async function addSignal(clanId: string, signalData: any) {
  try {
    await db.insert(voiceSignals).values({
      clanId,
      fromUserId: signalData.fromUserId,
      toUserId: signalData.toUserId || null,
      signal: signalData.signal,
    });
    
    // Cleanup old signals (older than 30 seconds)
    // In high volume, this should be a cron job, but for now this is fine
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000);
    // Note: Drizzle delete might need manual SQL for timestamp comparison if not fully typed, 
    // but let's try standard ORM first. 
    // Actually, let's skip auto-cleanup on every insert to save connections/time. 
    // Rely on a Cron or just let them pile up a bit (they are small).
    // Or just do a quick delete occasionally.
  } catch (e) {
    console.error("Failed to add signal", e);
  }
}

export async function getSignalsForClan(clanId: string, afterTimestamp?: number) {
  try {
    const afterDate = afterTimestamp ? new Date(afterTimestamp) : new Date(Date.now() - 10000);
    
    const signals = await db
      .select()
      .from(voiceSignals)
      .where(
        and(
          eq(voiceSignals.clanId, clanId),
          gt(voiceSignals.timestamp, afterDate)
        )
      );

    return signals.map(s => ({
      ...s,
      timestamp: s.timestamp.getTime(),
      signal: s.signal // Ensure it's returned as JSON
    }));
  } catch (e) {
    console.error("Failed to get signals", e);
    return [];
  }
}
