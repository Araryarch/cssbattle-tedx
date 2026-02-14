import { NextResponse } from "next/server";
import { db } from "@/db";
import { friends, users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";

export async function GET() {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendsList = await db
      .select({
        id: friends.id,
        status: friends.status,
        requesterId: friends.requesterId,
        userId: users.id,
        name: users.name,
        image: users.image,
        email: users.email,
        createdAt: friends.createdAt,
      })
      .from(friends)
      .leftJoin(users, or(
        and(eq(friends.receiverId, users.id), eq(friends.requesterId, payload.userId)),
        and(eq(friends.requesterId, users.id), eq(friends.receiverId, payload.userId))
      ))
      .where(or(
        eq(friends.requesterId, payload.userId),
        eq(friends.receiverId, payload.userId)
      ));

    const accepted = friendsList.filter(f => f.status === "accepted");
    const pending = friendsList.filter(f => f.status === "pending" && f.requesterId === payload.userId);
    const incoming = friendsList.filter(f => f.status === "pending" && f.requesterId !== payload.userId);

    return NextResponse.json({ 
      friends: accepted, 
      pendingRequests: pending,
      incomingRequests: incoming
    });
  } catch (error) {
    console.error("Get friends error:", error);
    return NextResponse.json({ error: "Failed to get friends" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (userId === payload.userId) {
      return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(friends)
      .where(or(
        and(eq(friends.requesterId, payload.userId), eq(friends.receiverId, userId)),
        and(eq(friends.requesterId, userId), eq(friends.receiverId, payload.userId))
      ))
      .then(res => res[0]);

    if (existing) {
      return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
    }

    const [friendRequest] = await db
      .insert(friends)
      .values({
        requesterId: payload.userId,
        receiverId: userId,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ request: friendRequest });
  } catch (error) {
    console.error("Send friend request error:", error);
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await request.json();

    const request_ = await db
      .select()
      .from(friends)
      .where(eq(friends.id, requestId))
      .then(res => res[0]);

    if (!request_) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request_.receiverId !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (action === "accept") {
      await db
        .update(friends)
        .set({ status: "accepted" })
        .where(eq(friends.id, requestId));
    } else if (action === "reject") {
      await db
        .delete(friends)
        .where(eq(friends.id, requestId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Handle friend request error:", error);
    return NextResponse.json({ error: "Failed to handle request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("id");

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    const request_ = await db
      .select()
      .from(friends)
      .where(eq(friends.id, requestId))
      .then(res => res[0]);

    if (!request_) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request_.requesterId !== payload.userId && request_.receiverId !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.delete(friends).where(eq(friends.id, requestId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete friend error:", error);
    return NextResponse.json({ error: "Failed to delete friend" }, { status: 500 });
  }
}
