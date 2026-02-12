"use client";

import Header from "@/components/Header";
import { useUser } from "@/components/UserProvider";
import { Shield, User, Mail, CheckCircle2, XCircle, Edit, Save, X, Camera } from "lucide-react";
import { useState } from "react";
import { updateUserAction, uploadAvatarAction } from "@/lib/user-actions";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", image: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        // Optimistic update or refresh
        setIsEditing(false);
        router.refresh();
        window.location.reload(); // Force reload to update context
    } catch (error) {
        console.error(error);
        toast.error("Failed to save profile");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        {loading ? (
          <p className="text-zinc-500 animate-pulse">Loading profile...</p>
        ) : !user ? (
          <p className="text-zinc-500">
            You are not logged in. Please sign in to view your profile.
          </p>
        ) : (
          <div className="space-y-8">
            <header className="border-l-2 border-primary pl-6 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">
                    My <span className="text-primary">Profile</span>
                </h1>
                <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest">
                    Manage your identity in the arena.
                </p>
              </div>
              {!isEditing ? (
                  <button 
                    onClick={startEditing}
                    className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                      <Edit className="w-3 h-3" /> Edit Profile
                  </button>
              ) : (
                  <div className="flex gap-2">
                       <button 
                        onClick={cancelEditing}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest transition-colors"
                        disabled={isSaving}
                      >
                          <X className="w-3 h-3" /> Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black hover:bg-primary/90 text-xs font-bold uppercase tracking-widest transition-colors"
                        disabled={isSaving}
                      >
                          {isSaving ? "Saving..." : <><Save className="w-3 h-3" /> Save Changes</>}
                      </button>
                  </div>
              )}
            </header>

            <section className="p-8 border border-white/10 bg-zinc-900/40 space-y-8 backdrop-blur-sm relative">
                {/* Editing Overlay Config */}
                
              <div className="flex items-start gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
                    {(isEditing ? formData.image : user.image) ? (
                        <img 
                            src={isEditing ? formData.image : user.image || ""} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        user.name?.[0]?.toUpperCase() || <User className="w-8 h-8" />
                    )}
                    </div>
                    {isEditing && (
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"/> : <Camera className="w-6 h-6 text-white" />}
                        </label>
                    )}
                </div>
                
                <div className="space-y-1 flex-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Codename</p>
                  {isEditing ? (
                      <input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="bg-black/50 border border-white/10 p-2 text-xl font-bold text-white w-full focus:border-primary outline-none"
                        placeholder="Enter nickname"
                      />
                  ) : (
                      <p className="text-3xl font-bold text-white tracking-tight">{user.name || "Anonymous"}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                     <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                     <span className="text-[10px] uppercase text-zinc-500 tracking-widest">Online</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
                <div className="p-4 bg-black/40 hover:bg-black/60 transition-colors group">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Email</p>
                  </div>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>

                <div className="p-4 bg-black/40 hover:bg-black/60 transition-colors group">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Role</p>
                  </div>
                  <p className="text-sm font-medium uppercase">{user.role || "user"}</p>
                </div>

                <div className="p-4 bg-black/40 hover:bg-black/60 transition-colors group col-span-1 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    {user.isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                        <XCircle className="w-4 h-4 text-yellow-500" />
                    )}
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</p>
                  </div>
                  <p className="text-sm font-medium">
                      {user.isVerified ? "Verified Operator" : "Pending verification"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

