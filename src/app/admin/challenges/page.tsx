"use client";

import Link from "next/link";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useAdminChallenges, useDeleteChallenge } from "@/lib/hooks";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export default function AdminChallengesPage() {
  const { data: challenges = [], isLoading } = useAdminChallenges();
  const deleteChallenge = useDeleteChallenge();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
      if (deleteId) {
          deleteChallenge.mutate(deleteId, {
              onSuccess: () => {
                  toast.success("Challenge deleted successfully");
                  setDeleteId(null);
              },
              onError: (err) => {
                  toast.error("Failed to delete challenge");
                  console.error(err);
              }
          });
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-zinc-400">Manage your coding challenges.</p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Challenge
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
      <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-900/50">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-zinc-400 font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {challenges.map((challenge: any) => (
              <tr key={challenge.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  {challenge.title}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium ${
                      challenge.difficulty === "Easy"
                        ? "text-green-400"
                        : challenge.difficulty === "Medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${
                      !challenge.isHidden
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {!challenge.isHidden ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/edit/${challenge.id}`}
                      className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(challenge.id)}
                      disabled={deleteChallenge.isPending}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete challenge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {challenges.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
                No challenges found. Create one to get started.
            </div>
        )}
      </div>
      )}

      <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Delete Challenge"
          description="Are you sure you want to delete this challenge? This action cannot be undone."
          confirmLabel="Delete Challenge"
          isLoading={deleteChallenge.isPending}
      />
    </div>
  );
}
