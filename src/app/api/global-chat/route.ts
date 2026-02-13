import { NextResponse } from "next/server";
import { db } from "@/db";
import { globalMessages, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    const payload = token ? await verifySession(token) : null;
    const userId = payload?.userId || null;

    console.log("Global chat SSE - userId:", userId);

    const messages = await db
      .select({
        id: globalMessages.id,
        senderId: globalMessages.senderId,
        content: globalMessages.content,
        createdAt: globalMessages.createdAt,
        senderName: users.name,
        senderImage: users.image,
      })
      .from(globalMessages)
      .leftJoin(users, eq(globalMessages.senderId, users.id))
      .orderBy(desc(globalMessages.createdAt))
      .limit(100);

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "init", messages: messages.reverse(), userId })}\n\n`));

        const interval = setInterval(async () => {
          try {
            const latestMessages = await db
              .select({
                id: globalMessages.id,
                senderId: globalMessages.senderId,
                content: globalMessages.content,
                createdAt: globalMessages.createdAt,
              })
              .from(globalMessages)
              .orderBy(desc(globalMessages.createdAt))
              .limit(20);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "update", messages: latestMessages.reverse() })}\n\n`));
          } catch (error) {
            console.error("SSE interval error:", error);
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
    console.error("SSE global chat error:", error);
    return NextResponse.json({ error: "Failed to connect", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Please login to chat" }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Please login to chat" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const [message] = await db
      .insert(globalMessages)
      .values({
        senderId: payload.userId,
        content: content.trim(),
      })
      .returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send global message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
