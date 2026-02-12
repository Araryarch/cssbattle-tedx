"use client";

import { useTransition } from "react";
import { Trash } from "lucide-react";
import { deleteContestAction } from "@/lib/contest-actions";

export default function DeleteContestButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this contest?")) {
      startTransition(async () => {
        await deleteContestAction(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
      title="Delete"
    >
      <Trash className="w-4 h-4" />
    </button>
  );
}
