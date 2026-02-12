"use client";

import { useUser } from "@/components/UserProvider";
import { Shield, Mail, CheckCircle2, XCircle, Edit, Save, X, Camera, Trophy, Target, Code } from "lucide-react";
import { useState, useEffect } from "react";
import { updateUserAction, uploadAvatarAction, getUserCompletedChallengesAction, getUserDetailsAction } from "@/lib/user-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user: sessionUser, loading: sessionLoading } = useUser();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", image: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
     if (sessionUser?.id) {
         Promise.all([
             getUserDetailsAction(),
             getUserCompletedChallengesAction()
         ]).then(([u, h]) => {
             setUser(u);
             setHistory(h);
             setLoading(false);
         });
     } else if (!sessionLoading && !sessionUser) {
         setLoading(false);
     }
  }, [sessionUser, sessionLoading]);

  const startEditing = () => {
    setFormData({ name: user?.name || "", image: user?.image || "" });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({ name: "", image: "" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadAvatarAction(formData);
        if (res.publicUrl) {
            setFormData(prev => ({ ...prev, image: res.publicUrl }));
            toast.success("Avatar uploaded");
        } else {
            toast.error("Upload failed");
        }
    } catch (error) {
        console.error(error);
        toast.error("Upload error");
    } finally {
        setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Name cannot be empty");
    setIsSaving(true);
    try {
        const res = await updateUserAction(formData);
        if (res.error) throw new Error(res.error);
        
        toast.success("Profile updated");
        setUser({ ...user, ...formData });
        setIsEditing(false);
        router.refresh();
    } catch (error) {
        console.error(error);
        toast.error("Failed to save profile");
    } finally {
        setIsSaving(false);
    }
  };

  const getRankColor = (title: string) => {
      switch(title) {
          case "dev": return "from-blue-400 to-cyan-600 shadow-blue-500/20";
          case "1grid": return "from-purple-400 to-fuchsia-600 shadow-purple-500/20";
          case "1flex": return "from-fuchsia-400 to-pink-600 shadow-fuchsia-500/20";
          case "2flex": return "from-red-400 to-orange-600 shadow-red-500/20";
          case "3flex": return "from-orange-400 to-amber-600 shadow-orange-500/20";
          case "4flex": return "from-yellow-400 to-amber-500 shadow-yellow-500/20";
          case "5flex": return "from-green-400 to-emerald-600 shadow-green-500/20";
          case "6flex": return "from-cyan-400 to-blue-600 shadow-cyan-500/20";
          case "7flex": return "from-slate-400 to-slate-600 shadow-slate-500/20";
          default: return "from-zinc-500 to-zinc-700 shadow-zinc-500/10";
      }
  };

  if (loading || sessionLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-500 text-sm animate-pulse">Loading Identity...</p>
              </div>
          </div>
      );
  }

  if (!user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
              <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold">Access Denied</h1>
                  <p className="text-zinc-500">Please sign in to view your profile.</p>
                  <Link href="/login" className="inline-block bg-primary text-black px-6 py-2 rounded font-bold hover:bg-primary/90">
                      Sign In
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30">
        
        {/* Banner */}
        <div className="h-64 w-full bg-gradient-to-b from-zinc-900 to-[#050505] relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(user.rank || "8flex")} opacity-20`}></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
        </div>

        <main className="max-w-7xl mx-auto px-6 relative -mt-32 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
                        
                        {/* Edit Button */}
                        {!isEditing ? (
                             <button onClick={startEditing} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20">
                                 <Edit className="w-4 h-4 text-zinc-400" />
                             </button>
                        ) : (
                             <div className="absolute top-4 right-4 flex gap-2 z-20">
                                 <button onClick={handleSave} disabled={isSaving} className="p-2 bg-primary text-black rounded-full hover:bg-primary/90">
                                     <Save className="w-4 h-4" />
                                 </button>
                                 <button onClick={cancelEditing} disabled={isSaving} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20">
                                     <X className="w-4 h-4" />
                                 </button>
                             </div>
                        )}

                        {/* Avatar */}
                        <div className="relative mb-6">
                            <div className={`w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-black shadow-2xl relative z-10 bg-zinc-900 mx-auto lg:mx-0`}>
                                {(isEditing ? formData.image : user.image) ? (
                                    <img 
                                        src={isEditing ? formData.image : user.image || ""} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-4xl font-bold text-zinc-700">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-20">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                        <Camera className="w-8 h-8 text-white" />
                                    </label>
                                )}
                            </div>
                            {/* Rank Badge Indicator */}
                             <div className={`absolute -bottom-3 -right-3 lg:left-24 lg:right-auto px-3 py-1 rounded-lg border border-white/10 shadow-lg bg-gradient-to-r ${getRankColor(user.rank || "8flex")} flex items-center gap-2 z-20`}>
                                <Trophy className="w-3 h-3 text-white" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{user.rank || "8flex"}</span>
                             </div>
                        </div>

                        {/* User Info */}
                        <div className="text-center lg:text-left space-y-4">
                            <div>
                                {isEditing ? (
                                     <input 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-2xl font-black text-white w-full text-center lg:text-left focus:border-primary outline-none"
                                        placeholder="Display Name"
                                      />
                                ) : (
                                    <h1 className="text-3xl font-black text-white tracking-tight">{user.name || "Anonymous"}</h1>
                                )}
                                <p className="text-zinc-500 font-mono text-sm">{user.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                 <div className="px-3 py-1 bg-white/5 rounded border border-white/5 flex items-center gap-2 text-xs font-medium text-zinc-400">
                                     <Shield className="w-3 h-3" /> {user.role || "User"}
                                 </div>
                                 <div className="px-3 py-1 bg-white/5 rounded border border-white/5 flex items-center gap-2 text-xs font-medium text-zinc-400">
                                     {user.isVerified ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-yellow-500" />}
                                     {user.isVerified ? "Verified" : "Unverified"}
                                 </div>
                            </div>
                        </div>

                         {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-8">
                             <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                 <div className="text-2xl font-bold text-white">{history.length}</div>
                                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Battles</div>
                             </div>
                             <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                 <div className="text-2xl font-bold text-white">
                                     {history.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0).toFixed(0)}
                                 </div>
                                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Score</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Recent Activity / History */}
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                            <Target className="w-5 h-5 text-primary" /> Battle History
                        </h2>
                        
                        <div className="space-y-4">
                             {history.length === 0 ? (
                                <div className="p-12 border border-white/5 border-dashed rounded-2xl bg-[#0a0a0c]/50 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                         <Trophy className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-400 font-medium">No battles recorded yet.</p>
                                    <p className="text-zinc-600 text-sm mt-1 max-w-sm">Every champion starts somewhere. Jump into the arena and prove your skills!</p>
                                    <Link href="/battle" className="mt-6 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors">
                                        Start Battling
                                    </Link>
                                </div>
                             ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {history.map((challenge, i) => (
                                         <Link 
                                            key={challenge.id + i} 
                                            href={`/battle/${challenge.id}`}
                                            className="group relative overflow-hidden bg-[#0a0a0c] border border-white/5 hover:border-primary/50 rounded-xl p-4 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 block"
                                         >
                                             <div className="flex items-start justify-between mb-4">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 rounded bg-zinc-900 border border-white/10 overflow-hidden text-white flex items-center justify-center">
                                                         {challenge.imageUrl ? (
                                                             <img src={challenge.imageUrl} className="w-full h-full object-cover" />
                                                         ) : (
                                                            <Code className="w-5 h-5 opacity-50"/>
                                                         )}
                                                     </div>
                                                     <div>
                                                         <h3 className="font-bold text-white text-sm group-hover:text-primary transition-colors line-clamp-1">
                                                             {challenge.title}
                                                         </h3>
                                                         <p className="text-xs text-zinc-500 font-mono">
                                                             {new Date(challenge.createdAt).toLocaleDateString()}
                                                         </p>
                                                     </div>
                                                 </div>
                                                 <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${parseFloat(challenge.accuracy) >= 90 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                     {challenge.accuracy}%
                                                 </div>
                                             </div>
                                             
                                             <div className="flex items-end justify-between">
                                                 <div className="text-xs text-zinc-500">
                                                     Score
                                                 </div>
                                                 <div className="text-xl font-black text-white font-mono tracking-tighter">
                                                     {challenge.score}
                                                 </div>
                                             </div>
                                             
                                             {/* Hover Glow */}
                                             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                         </Link>
                                     ))}
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
