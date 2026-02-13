"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
        if (!session) {
             router.replace("/login");
        } else if ((session.user as any).role !== "admin") {
             router.replace("/");
        }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!session || (session.user as any).role !== "admin") {
      return null;
  }

  return <>{children}</>;
}
