// In-memory signal buffer.
// Note: This is ephemeral and resets on server restart/hot-reload.
// For production, use Redis.
// Map<ClanID, Array<Signal>>
const signalBuffer = new Map<string, any[]>();

export function addSignal(clanId: string, signalData: any) {
  if (!signalBuffer.has(clanId)) {
    signalBuffer.set(clanId, []);
  }
  
  const signals = signalBuffer.get(clanId)!;
  signals.push({
    ...signalData,
    timestamp: Date.now()
  });

  // Clean old signals (> 10 seconds)
  const now = Date.now();
  const activeSignals = signals.filter(s => now - s.timestamp < 10000);
  signalBuffer.set(clanId, activeSignals);
}

export function getSignalsForClan(clanId: string) {
  return signalBuffer.get(clanId) || [];
}
