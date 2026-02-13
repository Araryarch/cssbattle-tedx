import { NextResponse } from "next/server";
import { db } from "@/db";
import { clans, clanMembers, clanMessages, users } from "@/db/schema";
import { eq, or, desc, ilike, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const mode = url.searchParams.get("mode");

    if (query || mode === "discover") {
       // Discovery Mode: List all clans matching query
       const results = await db.select().from(clans).where(query ? ilike(clans.name, `%${query}%`) : undefined);
       
       // Attach member counts manually
       const resultsWithCounts = await Promise.all(results.map(async (c) => {
          const members = await db.select().from(clanMembers).where(eq(clanMembers.clanId, c.id));
          return { ...c, _count: { members: members.length } };
       }));
       
       return NextResponse.json(resultsWithCounts);
    }

    // Default: Get User's Clans
    const userClans = await db
      .select({
        id: clans.id,
        name: clans.name,
        description: clans.description,
        ownerId: clans.ownerId,
        image: clans.image,
        role: clanMembers.role,
      })
      .from(clanMembers)
      .leftJoin(clans, eq(clanMembers.clanId, clans.id))
      .where(eq(clanMembers.userId, payload.userId));

    return NextResponse.json({ clans: userClans });
  } catch (error) {
    console.error("Get clans error:", error);
    return NextResponse.json({ error: "Failed to get clans" }, { status: 500 });
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

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Missing clan name" }, { status: 400 });
    }

    const existingClan = await db
      .select()
      .from(clans)
      .where(eq(clans.name, name))
      .then(res => res[0]);

    if (existingClan) {
      return NextResponse.json({ error: "Clan name already taken" }, { status: 400 });
    }

    const [clan] = await db
      .insert(clans)
      .values({
        name,
        description,
        ownerId: payload.userId,
      })
      .returning();

    await db
      .insert(clanMembers)
      .values({
        clanId: clan.id,
        userId: payload.userId,
        role: "owner",
      });

    return NextResponse.json({ clan });
  } catch (error) {
    console.error("Create clan error:", error);
    return NextResponse.json({ error: "Failed to create clan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const { clanId, userId, action } = await request.json();

    const clan = await db
      .select()
      .from(clans)
      .where(eq(clans.id, clanId))
      .then(res => res[0]);

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    if (action === "join") {
      const existingMember = await db
        .select()
        .from(clanMembers)
        .where(
          and(
            eq(clanMembers.clanId, clanId),
            eq(clanMembers.userId, payload.userId)
          )
        )
        .then(res => res[0]);

      if (existingMember) {
        return NextResponse.json({ error: "Already a member" }, { status: 400 });
      }

      await db
        .insert(clanMembers)
        .values({
          clanId,
          userId: payload.userId,
          role: "member",
        });
    } else if (action === "leave") {
      const member = await db
        .select()
        .from(clanMembers)
        .where(or(
          eq(clanMembers.clanId, clanId),
          eq(clanMembers.userId, payload.userId)
        ))
        .then(res => res[0]);

      if (!member) {
        return NextResponse.json({ error: "Not a member" }, { status: 400 });
      }

      if (member.role === "owner") {
        return NextResponse.json({ error: "Owner cannot leave, transfer ownership first" }, { status: 400 });
      }

      await db
        .delete(clanMembers)
        .where(or(
          eq(clanMembers.clanId, clanId),
          eq(clanMembers.userId, payload.userId)
        ));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clan action error:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
