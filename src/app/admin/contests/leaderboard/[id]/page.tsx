import { db } from "@/db";
import { contests, submissions, users, contestChallenges } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { ArrowLeft, Trophy, Crown, Medal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// Type for the leaderboard entry
type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  totalScore: number;
  challengesCompleted: number;
  lastSubmissionTime: Date;
};

export default async function ContestLeaderboardPage({ params }: { params: { id: string } }) {
  const contestId = params.id;

  // 1. Get contest details to display info
  const contest = await db.query.contests.findFirst({
    where: eq(contests.id, contestId),
  });

  if (!contest) {
    return <div className="p-8 text-white">Contest not found</div>;
  }

  // 2. Get all challenges in this contest
  const contestChallengeLinks = await db
    .select({ challengeId: contestChallenges.challengeId })
    .from(contestChallenges)
    .where(eq(contestChallenges.contestId, contestId));
  
  const challengeIds = contestChallengeLinks.map(c => c.challengeId);

  // 3. Fetch submissions for these challenges, during contest time (optional constraint, but good for real contests)
  // For now, let's just get best submission per user per challenge
  
  // Complexity: We need sum of best scores per user for the specific challenges in the contest
  
  // Approach:
  // - Get all submissions for challenges in this contest
  // - Group by user and challenge to find max score per challenge
  // - Then sum those max scores per user
  
  // This might be heavy in pure SQL for some ORMs, so we might do some processing in JS or complex query
  // Let's try a raw SQL or a query builder approach if Drizzle supports it easily.
  
  // Simplified JS processing approach for clarity and "hackathon" speed:
  // Fetch valid submissions
  const allSubmissions = await db
    .select({
      userId: submissions.userId,
      score: submissions.score,
      challengeId: submissions.challengeId,
      createdAt: submissions.createdAt,
      userName: users.name,
      userImage: users.image,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.id))
    .where(and(
        // In SQL IN clause needs at least one element or it fails/returns empty. Handle empty challengeIds.
        challengeIds.length > 0 ? sql`${submissions.challengeId} IN ${challengeIds}` : sql`1=0`
    ));

  // Process to find best score per challenge per user
  const userBestScores: Record<string, { [challengeId: string]: number }> = {};
  const userDetails: Record<string, { name: string, image: string | null, lastSub: Date }> = {};

  allSubmissions.forEach(sub => {
    if (!sub.userId || !sub.userName) return;

    if (!userBestScores[sub.userId]) {
      userBestScores[sub.userId] = {};
      userDetails[sub.userId] = { 
          name: sub.userName, 
          image: sub.userImage,
          lastSub: sub.createdAt
      };
    }

    const currentScore = parseFloat(sub.score);
    const existingBest = userBestScores[sub.userId][sub.challengeId] || 0;

    if (currentScore > existingBest) {
      userBestScores[sub.userId][sub.challengeId] = currentScore;
    }
    
    // Track latest submission for tie-breaking
    if (sub.createdAt > userDetails[sub.userId].lastSub) {
        userDetails[sub.userId].lastSub = sub.createdAt;
    }
  });

  // Calculate totals
  const leaderboard: LeaderboardEntry[] = Object.keys(userBestScores).map(userId => {
    const scores = Object.values(userBestScores[userId]);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const completed = scores.length; // Number of challenges attempted/scored > 0

    return {
      rank: 0, // Assigned after sort
      userId,
      userName: userDetails[userId].name,
      userImage: userDetails[userId].image,
      totalScore,
      challengesCompleted: completed,
      lastSubmissionTime: userDetails[userId].lastSub
    };
  });

  // Sort: High score first, then earlier submission time for ties
  leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.lastSubmissionTime.getTime() - b.lastSubmissionTime.getTime();
  });

  // Assign ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
            <Link
                href="/admin/contests"
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
                 <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Leaderboard</p>
                 <h1 className="text-3xl font-bold tracking-tight">{contest.title}</h1>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">Total Participants</span>
                <span className="text-3xl font-black">{leaderboard.length}</span>
            </div>
             <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">Challenges</span>
                <span className="text-3xl font-black">{challengeIds.length}</span>
            </div>
             <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">End Time</span>
                <span className="text-lg font-bold">{format(new Date(contest.endTime), "PP p")}</span>
            </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-20 text-center">Rank</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">User</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Challenges</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <tr key={entry.userId} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center">
                    {entry.rank === 1 && <Crown className="w-5 h-5 text-yellow-500 mx-auto fill-current" />}
                    {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400 mx-auto fill-current" />}
                    {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-700 mx-auto fill-current" />}
                    {entry.rank > 3 && <span className="font-mono text-zinc-500 font-bold">#{entry.rank}</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                            {entry.userImage ? (
                                <img src={entry.userImage} alt={entry.userName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-primary to-purple-600">
                                    {entry.userName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                             <div className="font-bold text-sm">{entry.userName}</div>
                             <div className="text-[10px] text-zinc-500 font-mono">{entry.lastSubmissionTime.toLocaleDateString()}</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-zinc-400">
                      {entry.challengesCompleted} / {challengeIds.length}
                  </td>
                  <td className="p-4 text-right">
                      <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold font-mono">
                          {entry.totalScore.toFixed(2)}
                      </span>
                  </td>
                </tr>
              ))}
              
              {leaderboard.length === 0 && (
                  <tr>
                      <td colSpan={4} className="p-12 text-center text-zinc-500 text-sm">
                          No submissions recorded yet for this contest.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
