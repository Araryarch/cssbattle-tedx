import { db } from "@/db";
import { contests, contestChallenges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Trophy, Crown, Medal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getContestLeaderboardAction } from "@/lib/submission-actions";

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

export default async function ContestLeaderboardPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const contestId = params.id;

  // 1. Get contest details to display info
  const contest = await db.query.contests.findFirst({
    where: eq(contests.id, contestId),
  });

  if (!contest) {
    return <div className="p-8 text-white">Contest not found</div>;
  }

  // 2. Fetch leaderboard using shared action (includes sync logic)
  const leaderboardData = await getContestLeaderboardAction(contestId);

  const leaderboard: LeaderboardEntry[] = leaderboardData.map((entry) => ({
    rank: entry.rank,
    userId: entry.userId,
    userName: entry.userName || "Anonymous",
    userImage: entry.userImage,
    totalScore: entry.totalScore,
    challengesCompleted: entry.challengesSolved || 0,
    lastSubmissionTime: entry.lastSubmissionAt
  }));

    // Calculate stats for header
    const totalParticipants = leaderboard.length;
    // We can get challenge count separately
    const challengeCountResult = await db
        .select({ count: contestChallenges.challengeId })
        .from(contestChallenges)
        .where(eq(contestChallenges.contestId, contestId));
    const challengeCount = challengeCountResult.length;

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
                <span className="text-3xl font-black">{totalParticipants}</span>
            </div>
             <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-2">Challenges</span>
                <span className="text-3xl font-black">{challengeCount}</span>
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
                      {entry.challengesCompleted} / {challengeCount}
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
