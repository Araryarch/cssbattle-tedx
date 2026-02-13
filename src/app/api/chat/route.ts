import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, conversations } from "@/db/schema";
import { eq, desc, or, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySession(token);
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

    const conversationsList = await db
      .select({
        id: conversations.id,
        userId: users.id,
        name: users.name,
        image: users.image,
        email: users.email,
        lastMessageAt: conversations.lastMessageAt,
      })
      .from(conversations)
      .leftJoin(users, or(
        and(eq(conversations.user1Id, currentUser.id), eq(users.id, conversations.user2Id)),
        and(eq(conversations.user2Id, currentUser.id), eq(users.id, conversations.user1Id))
      ))
      .where(or(
        eq(conversations.user1Id, currentUser.id),
        eq(conversations.user2Id, currentUser.id)
      ))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(20);

    return NextResponse.json({ conversations: conversationsList });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Failed to get conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sender = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .then((res) => res[0]);

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    const receiver = await db
      .select()
      .from(users)
      .where(eq(users.id, receiverId))
      .then((res) => res[0]);

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.user1Id, sender.id), eq(conversations.user2Id, receiverId)),
          and(eq(conversations.user1Id, receiverId), eq(conversations.user2Id, sender.id))
        )
      )
      .then((res) => res[0]);

    let conversation = existingConversation;

    if (!conversation) {
      const [newConversation] = await db
        .insert(conversations)
        .values({
          user1Id: sender.id,
          user2Id: receiverId,
        })
        .returning();
      conversation = newConversation;
    }

    const [message] = await db
      .insert(messages)
      .values({
        senderId: sender.id,
        receiverId,
        content,
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation!.id));

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
