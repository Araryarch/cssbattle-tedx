"use client";

import { useTransition, useState } from "react";
import { Trash } from "lucide-react";
import { deleteContestAction } from "@/lib/contest-actions";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export default function DeleteContestButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteContestAction(id);
        toast.success("Contest deleted successfully");
        setShowModal(false);
      } catch (error) {
        toast.error("Failed to delete contest");
        console.error(error);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash className="w-4 h-4" />
      </button>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Contest"
        description="Are you sure you want to delete this contest? This action cannot be undone and will remove all associated submissions."
        confirmLabel="Delete Contest"
        isLoading={isPending}
      />
    </>
  );
}
