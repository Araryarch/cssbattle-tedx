import { db } from "@/db";
import { users, submissions, challenges } from "@/db/schema";
import { desc, eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get recent submissions in the last 15 minutes as "active" users
    const fiveMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    // This is a simplified "live" view based on recent submission activity.
    // For true real-time "coding" status without websockets, we'd need a heartbeat text update.
    // Here we query submissions.
    
    const recentSubmissions = await db
      .select({
        userId: submissions.userId,
        userName: users.name,
        userAvatar: users.image,
        challengeTitle: challenges.title,
        status: submissions.score, // Just using score existence to imply submitted
        submittedAt: submissions.createdAt
      })
      .from(submissions)
      .innerJoin(users, eq(users.id, submissions.userId))
      .innerJoin(challenges, eq(challenges.id, submissions.challengeId))
      .where(gt(submissions.createdAt, fiveMinutesAgo))
      .orderBy(desc(submissions.createdAt))
      .limit(20);

    // Map to the frontend expected format
    // Since we only track submissions, everyone here has "submitted". 
    // To show "coding", we would need a separate 'user_activity' table updated by heartbeat.
    // For now, let's just show these as "Recent Activity" which is the best "Real Data" we have without new infra.
    
    const liveUsers = recentSubmissions.map(sub => ({
        id: sub.userId,
        name: sub.userName || "Anonymous",
        avatar: sub.userAvatar || "",
        currentChallenge: sub.challengeTitle,
        status: "submitted", // All we know is they submitted
        lastActive: sub.submittedAt
    }));

    // Remove duplicates (keep most recent)
    const uniqueUsers = Array.from(new Map(liveUsers.map(item => [item.id, item])).values());

    return NextResponse.json({ users: uniqueUsers });
  } catch (error) {
    console.error("Error fetching live users:", error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
