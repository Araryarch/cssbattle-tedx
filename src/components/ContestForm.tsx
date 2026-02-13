"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contest, saveContestAction } from "@/lib/contest-actions";
import { Challenge } from "@/lib/challenges";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { getChallengesAction } from "@/lib/actions";
import { toast } from "sonner";

interface ContestFormProps {
  initialData?: Contest;
}

export default function ContestForm({ initialData }: ContestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  const [formData, setFormData] = useState<Contest>(
    initialData || {
      title: "",
      description: "",
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // +1 hour default
      isActive: false,
      challengeIds: [],
    }
  );

  useEffect(() => {
    // Load all available challenges for selection
    const loadChallenges = async () => {
        const res = await getChallengesAction();
        setChallenges(res as unknown as Challenge[]);
    };
    loadChallenges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveContestAction(formData);
      toast.success(initialData ? "Contest updated successfully" : "Contest created successfully");
      router.push("/admin/contests");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save contest");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeToggle = (id: string) => {
    setFormData(prev => {
        const exists = prev.challengeIds.includes(id);
        if (exists) {
            return { ...prev, challengeIds: prev.challengeIds.filter(cid => cid !== id) };
        } else {
            return { ...prev, challengeIds: [...prev.challengeIds, id] };
        }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/admin/contests" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Contests
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Contest"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-xl font-bold mb-6">Contest Details</h3>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Title</label>
                    <input 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                        placeholder="e.g. Weekly CSS Battle #42"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                    <textarea 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 h-32 resize-none transition-colors placeholder:text-white/20"
                        placeholder="Describe the contest rules and theme..."
                        value={formData.description || ""}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-xl font-bold mb-6">Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Start Time</label>
                        <input 
                            type="datetime-local"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors invert-calendar-icon"
                            // Format: YYYY-MM-DDThh:mm
                            value={formData.startTime ? new Date(formData.startTime.getTime() - (formData.startTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                            onChange={e => {
                                const val = e.target.value;
                                if (val) {
                                    setFormData({...formData, startTime: new Date(val)});
                                }
                            }}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">End Time</label>
                        <input 
                            type="datetime-local"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors invert-calendar-icon"
                            value={formData.endTime ? new Date(formData.endTime.getTime() - (formData.endTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                            onChange={e => {
                                const val = e.target.value;
                                if (val) {
                                    setFormData({...formData, endTime: new Date(val)});
                                }
                            }}
                            required
                        />
                    </div>
                </div>
            </div>
            
            <div className="glass p-8 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-1">Publish Status</h3>
                        <p className="text-sm text-zinc-500">Make this contest visible to users immediately.</p>
                    </div>
                    <button
                        type="button" 
                        onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                        className={`w-14 h-8 rounded-full p-1 transition-colors relative ${formData.isActive ? 'bg-green-500' : 'bg-zinc-800'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Select Challenges</h3>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{formData.challengeIds.length} Selected</span>
                </div>
                
                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {challenges.map(challenge => (
                        <div 
                            key={challenge.id}
                            onClick={() => handleChallengeToggle(challenge.id)}
                            className={`
                                cursor-pointer p-4 rounded-xl border transition-all relative group
                                ${formData.challengeIds.includes(challenge.id) 
                                    ? 'bg-primary/10 border-primary text-white' 
                                    : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm truncate pr-2 ${formData.challengeIds.includes(challenge.id) ? 'text-primary' : 'text-zinc-300'}`}>
                                    {challenge.title}
                                </span>
                                {formData.challengeIds.includes(challenge.id) && (
                                    <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_theme(colors.primary.DEFAULT)] shrink-0 mt-1.5" />
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                    challenge.difficulty === 'Easy' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                    challenge.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                                    'border-red-500/30 text-red-500 bg-red-500/5'
                                }`}>
                                    {challenge.difficulty}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {challenges.length === 0 && (
                        <div className="text-center py-8 text-zinc-600 text-sm">
                            No challenges available. <Link href="/admin/challenges" className="text-primary hover:underline">Create one</Link>.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </form>
  );
}
