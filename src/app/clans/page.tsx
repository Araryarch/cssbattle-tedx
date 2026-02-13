"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, Users, MessageCircle, Crown, LogOut } from "lucide-react";
import api from "@/lib/axios";
import { useClans } from "@/lib/hooks/useClans";
import { useUser } from "@/components/UserProvider";
import Chat from "@/components/Chat";

type Clan = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  image: string | null;
  role: string;
};

type AllClan = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  memberCount: number;
};

export default function ClansPage() {
  const { user } = useUser();
  const { clans, createClan, joinClan, leaveClan } = useClans();
  const [allClans, setAllClans] = useState<AllClan[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newClanName, setNewClanName] = useState("");
  const [newClanDesc, setNewClanDesc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllClans = async () => {
      try {
        const { data } = await api.get("/clans/all");
        setAllClans(data.clans || []);
      } catch (error) {
        console.error("Failed to fetch clans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllClans();
  }, []);

  const handleCreateClan = () => {
    if (!newClanName.trim()) return;
    createClan.mutate({ name: newClanName, description: newClanDesc });
    setShowCreate(false);
    setNewClanName("");
    setNewClanDesc("");
  };

  const isMember = (clanId: string) => clans.some(c => c.id === clanId);
  const myClan = clans[0];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Clans</h1>
        <p className="text-white/40">Sign in to join or create a clan</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clans</h1>
          <p className="text-white/40">Join a clan and compete together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Clan
        </button>
      </div>

      {myClan && (
        <div className="mb-12 p-6 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{myClan.name}</h2>
                  {myClan.role === "owner" && <Crown className="w-4 h-4 text-yellow-400" />}
                </div>
                <p className="text-white/40 text-sm capitalize">{myClan.role}</p>
              </div>
            </div>
              <button
              onClick={() => leaveClan.mutate(myClan.id)}
              className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="mb-8 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white mb-4">Create New Clan</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Clan name"
              value={newClanName}
              onChange={(e) => setNewClanName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newClanDesc}
              onChange={(e) => setNewClanDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateClan}
                disabled={!newClanName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-white mb-4">All Clans</h2>
        {isLoading ? (
          <div className="text-white/30 text-center py-8">Loading...</div>
        ) : allClans.length === 0 ? (
          <div className="text-white/30 text-center py-8">No clans yet. Be the first to create one!</div>
        ) : (
          <div className="grid gap-3">
            {allClans.map((clan) => (
              <div
                key={clan.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{clan.name}</h3>
                    <p className="text-sm text-white/40">{clan.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-white/40 text-sm">
                    <Users className="w-4 h-4" />
                    {clan.memberCount || 1}
                  </div>
                  {isMember(clan.id) ? (
                    <button
                      disabled
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm"
                    >
                      Joined
                    </button>
                  ) : myClan ? (
                    <button
                      disabled
                      className="px-3 py-1.5 bg-white/5 text-white/30 rounded-lg text-sm cursor-not-allowed"
                    >
                      Already in clan
                    </button>
                  ) : (
                    <button
                      onClick={() => joinClan.mutate(clan.id)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Chat />
    </div>
  );
}
