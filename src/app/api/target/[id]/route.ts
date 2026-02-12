import { NextRequest, NextResponse } from "next/server";
import { getChallengeAction } from "@/lib/actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const challenge = await getChallengeAction(id);

  if (!challenge || !challenge.imageUrl) {
    // Return a default placeholder or 404
    // Ideally user uploads image, or we have a default no-image SVG
    return new NextResponse("Not Found", { status: 404 });
  }

  // If it's a URL, restart to it (proxying might be better but redirect is simpler for now)
  // If it's base64 or stored, we'd serve it. Currently assuming URL.
  if (challenge.imageUrl.startsWith("http")) {
      return NextResponse.redirect(challenge.imageUrl);
  }
  
  // If we had local storage, we'd read file here.
  return new NextResponse("Not Found", { status: 404 });
}
