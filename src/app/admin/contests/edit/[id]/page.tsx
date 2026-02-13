import ContestForm from "@/components/ContestForm";
import { getContestAction } from "@/lib/contest-actions";

export default async function EditContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contest = await getContestAction(id);

  if (!contest) {
    return <div className="min-h-screen bg-[#050505] text-white p-8 flex items-center justify-center">
      <p className="text-zinc-500">Contest not found</p>
    </div>;
  }

  // Cast for component prop compatibility if needed (DB types vs View types)
  const formattedContest = {
      ...contest,
      challengeIds: contest.challengeIds || [] // ensure array
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <ContestForm initialData={formattedContest as any} />
    </div>
  );
}
