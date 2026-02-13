import { db } from "@/db";
import { users, submissions, challenges } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { User, Mail, Trophy, Code, Calendar } from "lucide-react";
import Link from "next/link";

async function getUserProfile(id: string) {
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      rank: users.rank,
    })
    .from(users)
    .where(eq(users.id, id))
    .then((res) => res[0]);

  if (!user) return null;

  const stats = await db
    .select({
      totalSubmissions: sql<number>`count(${submissions.id})`,
      bestScore: sql<string>`max(${submissions.score})`,
      uniqueChallenges: sql<number>`count(distinct ${submissions.challengeId})`,
    })
    .from(submissions)
    .where(eq(submissions.userId, id))
    .then((res) => res[0]);

  const recentSubmissions = await db
    .select({
      id: submissions.id,
      score: submissions.score,
      accuracy: submissions.accuracy,
      createdAt: submissions.createdAt,
      challengeTitle: challenges.title,
    })
    .from(submissions)
    .leftJoin(challenges, eq(submissions.challengeId, challenges.id))
    .where(eq(submissions.userId, id))
    .orderBy(desc(submissions.createdAt))
    .limit(10);

  return { user, stats, recentSubmissions };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUserProfile(id);

  if (!data) {
    notFound();
  }

  const { user, stats, recentSubmissions } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-32 h-32 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
          {user.image ? (
            <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-white/20" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{user.name || "Unnamed User"}</h1>
          <div className="flex items-center gap-4 text-white/40 text-sm mb-4">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {user.email}
            </span>
            {user.rank && (
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {user.rank}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/socials?chat=${user.id}`}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Message
            </Link>
            <Link
              href="/socials"
              className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Find Friends
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Code className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Submissions</span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalSubmissions || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Best Score</span>
          </div>
          <p className="text-2xl font-bold">{stats?.bestScore || "0"}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Challenges</span>
          </div>
          <p className="text-2xl font-bold">{stats?.uniqueChallenges || 0}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {recentSubmissions.length === 0 ? (
            <p className="text-white/30 text-sm">No submissions yet</p>
          ) : (
            recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]"
              >
                <div>
                  <p className="text-white text-sm">{sub.challengeTitle || "Unknown Challenge"}</p>
                  <p className="text-white/30 text-xs">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold">{sub.score}</p>
                  <p className="text-white/30 text-xs">{sub.accuracy}% accuracy</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
