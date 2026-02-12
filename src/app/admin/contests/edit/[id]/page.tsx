import ContestForm from "@/components/ContestForm";
import { getContestAction } from "@/lib/contest-actions";

export default async function EditContestPage({ params }: { params: { id: string } }) {
  const contest = await getContestAction(params.id);

  if (!contest) {
    return <div>Contest not found</div>;
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
