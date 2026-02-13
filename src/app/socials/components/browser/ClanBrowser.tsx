import React, { useState, useEffect } from "react";
import { Search, Users, Shield, Plus, Globe } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { SectionHeader } from "../SectionHeader";
import { UserAvatar } from "../UserAvatar";

export const ClanBrowser = ({ activeChannelId, setActiveChannelId }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clans, setClans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of popular/all clans
    fetchClans();
  }, []);

  const fetchClans = async (query?: string) => {
    setIsLoading(true);
    try {
      // Assuming existing /api/clans endpoint supports search or fetch all
      // If not, we might need to adjust or create a new endpoint.
      // For now, let's try querying the main clans endpoint.
      const url = query ? `/clans?q=${encodeURIComponent(query)}` : '/clans';
      const { data } = await api.get(url);
      if (Array.isArray(data)) {
        setClans(data);
      } else if (data && Array.isArray(data.clans)) {
        setClans(data.clans);
      } else {
        console.error("Invalid clans response:", data);
        setClans([]);
      }
    } catch (e) {
      console.error(e);
      setClans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClans(searchQuery);
  };

  const handleJoin = async (clanId: string) => {
     try {
       await api.put('/clans', { clanId, action: 'join' });
       alert("Successfully joined the clan!");
       // Ideally refresh the parent state or redirect
       window.location.reload(); 
     } catch (e) {
       console.error(e);
       alert("Failed to join clan.");
     }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      <SectionHeader 
        title="Server Discovery" 
        icon={Globe}
        actions={
          <div className="relative">
             <input 
               className="bg-black border border-white/10 pl-8 pr-4 py-1 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-primary focus:outline-none w-64 transition-all"
               placeholder="SEARCH_SERVERS"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && fetchClans(searchQuery)}
             />
             <Search className="absolute left-2 top-1.5 w-3 h-3 text-zinc-500" />
          </div>
        }
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
           <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold font-mono text-white uppercase tracking-widest mb-2">Find Your Community</h1>
              <p className="text-zinc-500 font-mono text-sm max-w-lg mx-auto">
                Explore available servers and join forces with other developers.
              </p>
           </div>

           {isLoading ? (
             <div className="text-center py-20 text-zinc-500 font-mono animate-pulse">SEARCHING_DATABASE...</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {Array.isArray(clans) && clans.map((clan) => (
                 <div key={clan.id} className="group bg-black border border-white/10 hover:border-primary/50 transition-all p-0 flex flex-col">
                    <div className="h-24 bg-zinc-900 border-b border-white/5 relative overflow-hidden">
                       {/* Banner placeholder or image if available */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
                       {clan.image && (
                          <img src={clan.image} alt={clan.name} className="w-full h-full object-cover opacity-50" />
                       )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col relative">
                       <div className="absolute -top-6 left-4">
                          <UserAvatar src={clan.image} name={clan.name} className="w-12 h-12 border-4 border-black" />
                       </div>
                       
                       <div className="mt-6 mb-2">
                          <h3 className="font-bold font-mono text-white truncate uppercase overflow-hidden text-ellipsis whitespace-nowrap" title={clan.name}>{clan.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                             <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {clan._count?.members || 0} Members</span>
                          </div>
                       </div>
                       
                       <div className="mt-auto pt-4 flex gap-2">
                          <button 
                            onClick={() => handleJoin(clan.id)}
                            className="flex-1 py-2 bg-zinc-900 border border-white/10 text-white font-mono text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors"
                          >
                             Join Server
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
               
               {clans.length === 0 && !isLoading && (
                 <div className="col-span-full py-20 text-center">
                    <p className="text-zinc-500 font-mono">NO SERVERS FOUND MATCHING QUERY</p>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
