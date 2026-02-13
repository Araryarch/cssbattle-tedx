import { NextResponse } from "next/server";
import { db } from "@/db";
import { clanMessages, clanMembers, users, voiceParticipants } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";
import { getSignalsForClan } from "@/lib/signal-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clanId: string }> }
) {
  try {
    const { clanId } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await db
      .select()
      .from(clanMembers)
      .where(
        and(
          eq(clanMembers.clanId, clanId),
          eq(clanMembers.userId, payload.userId)
        )
      )
      .then(res => res[0]);

    if (!member) {
      return NextResponse.json({ error: "Not a member of this clan" }, { status: 403 });
    }

    const messages = await db
      .select({
        id: clanMessages.id,
        senderId: clanMessages.senderId,
        content: clanMessages.content,
        createdAt: clanMessages.createdAt,
        senderName: users.name,
        senderImage: users.image,
      })
      .from(clanMessages)
      .leftJoin(users, eq(clanMessages.senderId, users.id))
      .where(eq(clanMessages.clanId, clanId))
      .orderBy(desc(clanMessages.createdAt))
      .limit(50);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const fetchVoiceState = async () => {
          return await db
          .select({
            id: voiceParticipants.id,
            channelId: voiceParticipants.channelId,
            userId: users.id,
            name: users.name,
            image: users.image,
          })
          .from(voiceParticipants)
          .leftJoin(users, eq(voiceParticipants.userId, users.id))
          .where(eq(voiceParticipants.clanId, clanId));
        };

        const initialVoice = await fetchVoiceState();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "voice-update", participants: initialVoice })}\n\n`));

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "init", messages: messages.reverse() })}\n\n`));

        let lastSignalTimestamp = Date.now();

        const interval = setInterval(async () => {
          try {
            // ... (keep messages logic) ...
            const latestMessages = await db
              .select({
                id: clanMessages.id,
                senderId: clanMessages.senderId,
                content: clanMessages.content,
                createdAt: clanMessages.createdAt,
                senderName: users.name,
                senderImage: users.image,
              })
              .from(clanMessages)
              .leftJoin(users, eq(clanMessages.senderId, users.id))
              .where(eq(clanMessages.clanId, clanId))
              .orderBy(desc(clanMessages.createdAt))
              .limit(10);
            
            const voiceState = await fetchVoiceState();

            // Handle Signals
            const signals = getSignalsForClan(clanId);
            const newSignals = signals.filter((s: any) => 
              s.timestamp > lastSignalTimestamp &&
              s.fromUserId !== payload.userId && // Don't echo back
              (!s.toUserId || s.toUserId === payload.userId)
            );

            if (newSignals.length > 0) {
               lastSignalTimestamp = Math.max(...newSignals.map((s: any) => s.timestamp));
               controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "voice-signal", signals: newSignals })}\n\n`));
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "update", messages: latestMessages.reverse() })}\n\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "voice-update", participants: voiceState })}\n\n`));
          } catch (error) {
            console.error("SSE error:", error);
          }
        }, 1000);

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
    console.error("SSE clan chat error:", error);
    return NextResponse.json({ error: "Failed to connect" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clanId: string }> }
) {
  try {
    const { clanId: paramClanId } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    const clanId = paramClanId;

    if (!clanId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const member = await db
      .select()
      .from(clanMembers)
      .where(
        and(
          eq(clanMembers.clanId, clanId),
          eq(clanMembers.userId, payload.userId)
        )
      )
      .then(res => res[0]);

    if (!member) {
      return NextResponse.json({ error: "Not a member of this clan" }, { status: 403 });
    }

    const [message] = await db
      .insert(clanMessages)
      .values({
        clanId,
        senderId: payload.userId,
        content,
      })
      .returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send clan message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
