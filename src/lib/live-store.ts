// In-memory store for live coding sessions
// This persists within the Node.js process and is shared across all requests

export type LiveCodeEntry = {
  userId: string;
  userName: string;
  challengeId: string;
  challengeTitle: string;
  contestId?: string;
  code: string;
  lastUpdate: number; // Date.now()
};

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

class LiveCodeStore {
  private entries: Map<string, LiveCodeEntry> = new Map();
  private clients: Set<SSEClient> = new Set();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup entries older than 10 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const TEN_MINUTES = 10 * 60 * 1000;
      for (const [key, entry] of this.entries) {
        if (now - entry.lastUpdate > TEN_MINUTES) {
          this.entries.delete(key);
        }
      }
    }, 60_000); // Check every minute
  }

  private getKey(userId: string, challengeId: string): string {
    return `${userId}:${challengeId}`;
  }

  /**
   * Update or create a live code entry and broadcast to all SSE clients
   */
  update(entry: LiveCodeEntry): void {
    const key = this.getKey(entry.userId, entry.challengeId);
    this.entries.set(key, { ...entry, lastUpdate: Date.now() });
    this.broadcast(entry);
  }

  /**
   * Get all currently active coding sessions
   */
  getActive(): LiveCodeEntry[] {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const active: LiveCodeEntry[] = [];

    for (const entry of this.entries.values()) {
      if (now - entry.lastUpdate < FIVE_MINUTES) {
        active.push(entry);
      }
    }

    return active.sort((a, b) => b.lastUpdate - a.lastUpdate);
  }

  /**
   * Get code for a specific user+challenge
   */
  getEntry(userId: string, challengeId: string): LiveCodeEntry | undefined {
    return this.entries.get(this.getKey(userId, challengeId));
  }

  /**
   * Remove a user's session (e.g., when they leave the page)
   */
  remove(userId: string, challengeId: string): void {
    this.entries.delete(this.getKey(userId, challengeId));
    this.broadcastActiveList();
  }

  /**
   * Register an SSE client
   */
  addClient(client: SSEClient): void {
    this.clients.add(client);
  }

  /**
   * Unregister an SSE client
   */
  removeClient(client: SSEClient): void {
    this.clients.delete(client);
  }

  /**
   * Broadcast a code update to all connected SSE admin clients
   */
  private broadcast(entry: LiveCodeEntry): void {
    const message = `data: ${JSON.stringify({
      type: "code-update",
      ...entry,
    })}\n\n`;

    for (const client of this.clients) {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
      } catch {
        // Client disconnected, remove it
        this.clients.delete(client);
      }
    }
  }

  /**
   * Broadcast the active users list to all SSE clients
   */
  private broadcastActiveList(): void {
    const active = this.getActive();
    const message = `data: ${JSON.stringify({
      type: "active-list",
      users: active,
    })}\n\n`;

    for (const client of this.clients) {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

// Singleton: attach to globalThis to survive hot-reloads in dev
const globalForLiveStore = globalThis as unknown as {
  __liveCodeStore?: LiveCodeStore;
};

export const liveCodeStore =
  globalForLiveStore.__liveCodeStore ?? new LiveCodeStore();

if (process.env.NODE_ENV !== "production") {
  globalForLiveStore.__liveCodeStore = liveCodeStore;
}
