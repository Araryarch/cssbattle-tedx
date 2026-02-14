import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .then((res) => res[0]);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversationMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderName: users.name,
        senderImage: users.image,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, currentUser.id), eq(messages.receiverId, userId)),
          and(eq(messages.senderId, userId), eq(messages.receiverId, currentUser.id))
        )
      )
      .orderBy(messages.createdAt);

    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, userId),
          eq(messages.receiverId, currentUser.id),
          eq(messages.isRead, false)
        )
      );

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "init", messages: conversationMessages })}\n\n`));

        const interval = setInterval(async () => {
          try {
            const latestMessages = await db
              .select({
                id: messages.id,
                senderId: messages.senderId,
                receiverId: messages.receiverId,
                content: messages.content,
                isRead: messages.isRead,
                createdAt: messages.createdAt,
                senderName: users.name,
                senderImage: users.image,
              })
              .from(messages)
              .leftJoin(users, eq(messages.senderId, users.id))
              .where(
                or(
                  and(eq(messages.senderId, currentUser.id), eq(messages.receiverId, userId)),
                  and(eq(messages.senderId, userId), eq(messages.receiverId, currentUser.id))
                )
              )
              .orderBy(messages.createdAt);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "update", messages: latestMessages })}\n\n`));
          } catch (error) {
            console.error("SSE error:", error);
          }
        }, 3000);

        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
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
    console.error("SSE chat error:", error);
    return NextResponse.json({ error: "Failed to connect" }, { status: 500 });
  }
}
