import { NextResponse } from "next/server";
import { db } from "@/db";
import { globalMessages, users } from "@/db/schema";
import { eq, desc, lt, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";

const MAX_MESSAGES = 500;
const CLEANUP_THRESHOLD = 600; // Keep only last 100 messages (clean old ones)

async function cleanupOldMessages() {
  try {
    const oldMessages = await db
      .select({ id: globalMessages.id, createdAt: globalMessages.createdAt })
      .from(globalMessages)
      .orderBy(desc(globalMessages.createdAt))
      .limit(CLEANUP_THRESHOLD)
      .offset(CLEANUP_THRESHOLD);

    if (oldMessages.length > 0) {
      const idsToDelete = oldMessages.map(m => m.id);
      await db
        .delete(globalMessages)
        .where(eq(globalMessages.id, idsToDelete[0])); // Delete oldest individually if needed
    }
  } catch (e) {
    console.error("Cleanup error:", e);
  }
}

export async function GET(request: Request) {
  try {
    const payload = await verifySession();
    const userId = payload?.userId || null;

    // Cleanup old messages periodically
    if (Math.random() < 0.1) cleanupOldMessages();

    const messages = await db
      .select({
        id: globalMessages.id,
        senderId: globalMessages.senderId,
        content: globalMessages.content,
        createdAt: globalMessages.createdAt,
        senderName: users.name,
        senderImage: users.image,
        senderRank: users.rank,
        senderRole: users.role,
      })
      .from(globalMessages)
      .leftJoin(users, eq(globalMessages.senderId, users.id))
      .orderBy(desc(globalMessages.createdAt))
      .limit(MAX_MESSAGES);

    // Map admin role to "dev" rank
    const mappedMessages = messages.map(m => ({
      ...m,
      senderRank: m.senderRole === "admin" ? "dev" : (m.senderRank || "8flex"),
    }));

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "init", messages: mappedMessages.reverse(), userId })}\n\n`));

        const interval = setInterval(async () => {
          try {
            const latestMessages = await db
              .select({
                id: globalMessages.id,
                senderId: globalMessages.senderId,
                content: globalMessages.content,
                createdAt: globalMessages.createdAt,
                senderName: users.name,
                senderImage: users.image,
                senderRank: users.rank,
                senderRole: users.role,
              })
              .from(globalMessages)
              .leftJoin(users, eq(globalMessages.senderId, users.id))
              .orderBy(desc(globalMessages.createdAt))
              .limit(50);

            const mapped = latestMessages.map(m => ({
              ...m,
              senderRank: m.senderRole === "admin" ? "dev" : (m.senderRank || "8flex"),
            }));

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "update", messages: mapped.reverse() })}\n\n`));
          } catch (e) {
            console.error("SSE error:", e);
          }
        }, 2000);

        const abortHandler = () => {
          clearInterval(interval);
          controller.close();
        };

        request.signal.addEventListener("abort", abortHandler);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE error:", error);
    return NextResponse.json({ error: "Failed to connect", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Please login to chat" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const [message] = await db
      .insert(globalMessages)
      .values({
        senderId: payload.userId,
        content: content.trim(),
      })
      .returning();

    // Cleanup if too many messages
    const count = await db.select({ count: globalMessages.id }).from(globalMessages).limit(1);
    // Simple cleanup - just delete old if over limit
    if (count && count.length > 0) {
      cleanupOldMessages();
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
