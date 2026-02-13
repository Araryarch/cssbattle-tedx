import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CertificateView from "./certificate-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      rank: users.rank,
    })
    .from(users)
    .where(eq(users.id, id))
    .then((res) => res[0]);

  if (!user || !user.name) notFound();

  const eligibleRanks = ["dev", "1grid", "1flex", "2flex", "3flex", "4flex"];
  if (!user.rank || !eligibleRanks.includes(user.rank)) notFound();

  return <CertificateView userId={user.id} userName={user.name} userRank={user.rank} />;
}
