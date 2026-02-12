import { liveCodeStore } from "@/lib/live-store";

// GET /api/live-code/stream — SSE endpoint for admin to subscribe to real-time code updates
export async function GET() {
  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      // Register this client
      const client = { id: clientId, controller };
      liveCodeStore.addClient(client);

      // Send initial data: all currently active sessions
      const active = liveCodeStore.getActive();
      const initMessage = `data: ${JSON.stringify({
        type: "init",
        users: active,
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initMessage));

      // Send heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`: heartbeat ${Date.now()}\n\n`)
          );
        } catch {
          clearInterval(heartbeat);
          liveCodeStore.removeClient(client);
        }
      }, 15_000);

      // Cleanup when the client disconnects
      // We use a custom close handler by storing the cleanup function
      (controller as any).__cleanup = () => {
        clearInterval(heartbeat);
        liveCodeStore.removeClient(client);
      };
    },
    cancel(controller) {
      // Called when the request is aborted (client disconnects)
      if ((controller as any)?.__cleanup) {
        (controller as any).__cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
