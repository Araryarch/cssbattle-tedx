import React, { useState, useEffect } from "react";
import { Users, X, MessageSquare } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { UserAvatar } from "./UserAvatar";
import api from "@/lib/axios";

interface FriendsDashboardProps {
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  friendSearch: string;
  setFriendSearch: (s: string) => void;
  friendSearchResults: any[];
  setFriendSearchResults: (res: any[]) => void;
  pendingRequests: any[];
  incomingRequests: any[];
  friends: any[];
  sendRequest: any;
  respondToRequest: any;
  handleChannelSwitch: (id: string) => void;
}

export const FriendsDashboard: React.FC<FriendsDashboardProps> = ({
  activeChannelId,
  setActiveChannelId,
  friendSearch,
  setFriendSearch,
  friendSearchResults,
  setFriendSearchResults,
  pendingRequests,
  incomingRequests,
  friends,
  sendRequest,
  respondToRequest,
  handleChannelSwitch
}) => {
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);

  useEffect(() => {
    if (activeChannelId === "add") {
       const timer = setTimeout(async () => {
         if (friendSearch.length < 2) { setFriendSearchResults([]); return; }
         setIsSearchingFriends(true);
         try {
           const { data } = await api.get(`/search?q=${encodeURIComponent(friendSearch)}`);
           setFriendSearchResults(data.users || []);
         } catch(e) { console.error(e); }
         finally { setIsSearchingFriends(false); }
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [friendSearch, activeChannelId]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      <SectionHeader 
        title="Friends Index"
        icon={Users}
        actions={
          <div className="flex bg-black border border-white/10 p-1 gap-1">
            <button onClick={() => setActiveChannelId('friends')} className={`px-3 py-1 text-xs font-mono uppercase ${activeChannelId === 'friends' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'}`}>All</button>
            <button onClick={() => setActiveChannelId('pending')} className={`px-3 py-1 text-xs font-mono uppercase ${activeChannelId === 'pending' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'}`}>Pending</button>
            <button onClick={() => setActiveChannelId('add')} className={`px-3 py-1 text-xs font-mono uppercase ${activeChannelId === 'add' ? 'bg-white text-black font-bold' : 'text-primary hover:text-red-400'}`}>Add New</button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          
          {activeChannelId === 'add' && (
            <div className="max-w-2xl mx-auto mt-10">
              <h2 className="text-white font-mono font-bold text-lg mb-2 uppercase tracking-tight">Add Friend</h2>
              <p className="text-zinc-500 font-mono text-xs mb-6">Input username to initiate connection request.</p>
              
              <div className="flex gap-4 mb-8">
                <input 
                  className="flex-1 bg-black border border-white/10 p-4 text-white font-mono text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-700"
                  placeholder="ENTER_USERNAME"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  autoFocus
                />
                <button 
                   className="bg-primary text-white px-6 font-mono text-sm font-bold uppercase hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   disabled={!friendSearch}
                 >
                   Send Request
                 </button>
              </div>
              
              {friendSearchResults.length > 0 && (
                 <div className="border border-white/10 bg-black">
                    {friendSearchResults.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 border-b border-white/10 last:border-0 hover:bg-zinc-900">
                          <div className="flex items-center gap-4">
                            <UserAvatar src={u.image} name={u.name} />
                            <div>
                              <div className="font-bold font-mono text-white flex items-center gap-2">
                                {u.name}
                                {pendingRequests.some(p => p.userId === u.id) && <span className="text-[10px] bg-zinc-800 px-1 text-zinc-400">SENT</span>}
                              </div>
                            </div>
                          </div>
                          <button 
                             onClick={() => {
                                sendRequest.mutate(u.id, {
                                   onSuccess: () => {
                                      alert("Request Transmitted."); 
                                      setFriendSearch("");
                                      setFriendSearchResults([]);
                                   },
                                   onError: () => {
                                      alert("Transmission Failed: Duplicate or Invalid.");
                                   }
                                });
                             }}
                            className="border border-primary/50 text-primary hover:bg-primary hover:text-white px-3 py-1 text-xs font-mono uppercase transition-all"
                          >
                            Connect
                          </button>
                      </div>
                    ))}
                 </div>
              )}
            </div>
          )}

          {activeChannelId === 'pending' && (
            <div className="max-w-3xl mx-auto space-y-8">
               {(incomingRequests.length > 0 || pendingRequests.length > 0) ? (
                 <>
                   {incomingRequests.length > 0 && (
                     <div>
                       <h3 className="text-xs font-bold font-mono text-zinc-500 uppercase mb-4 border-b border-white/10 pb-2">Incoming Requests — {incomingRequests.length}</h3>
                       <div className="grid gap-2">
                         {incomingRequests.map(req => (
                           <div key={req.id} className="flex items-center justify-between p-3 bg-black border border-white/10">
                              <div className="flex items-center gap-3">
                                <UserAvatar src={req.image} name={req.name} />
                                <span className="font-bold font-mono text-white">{req.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => respondToRequest.mutate({ requestId: req.id, action: "accept" })} className="h-8 px-3 bg-primary text-white text-xs font-mono uppercase font-bold hover:bg-red-600 transition-colors">
                                  Accept
                                </button>
                                <button onClick={() => respondToRequest.mutate({ requestId: req.id, action: "reject" })} className="h-8 px-3 border border-white/20 text-white text-xs font-mono uppercase hover:bg-red-900/50 hover:border-red-500 transition-colors">
                                  Deny
                                </button>
                              </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   {pendingRequests.length > 0 && (
                     <div>
                       <h3 className="text-xs font-bold font-mono text-zinc-500 uppercase mb-4 border-b border-white/10 pb-2">Outgoing Requests — {pendingRequests.length}</h3>
                       <div className="grid gap-2">
                         {pendingRequests.map(req => (
                           <div key={req.id} className="flex items-center justify-between p-3 bg-black border border-white/10 opacity-75">
                              <div className="flex items-center gap-3">
                                <UserAvatar src={req.image} name={req.name} />
                                <span className="font-bold font-mono text-white">{req.name}</span>
                              </div>
                              <button className="text-zinc-500 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                              </button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="text-center py-20">
                   <div className="inline-block p-4 border border-zinc-800 bg-black mb-4">
                     <Users className="w-8 h-8 text-zinc-700" />
                   </div>
                   <p className="font-mono text-zinc-600 text-sm">NO PENDING TRANSMISSIONS</p>
                 </div>
               )}
            </div>
          )}
          
          {activeChannelId === 'friends' && (
            <div className="max-w-3xl mx-auto">
              <div className="grid gap-px bg-zinc-900 border border-zinc-900">
                {friends.map(friend => (
                  <div 
                     key={friend.id} 
                     className="flex items-center justify-between p-4 bg-black hover:bg-zinc-900 transition-colors group"
                  >
                     <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleChannelSwitch(friend.userId)}>
                       <UserAvatar src={friend.image} name={friend.name} status="online" />
                       <div>
                          <div className="font-bold font-mono text-white">{friend.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Online</div>
                       </div>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleChannelSwitch(friend.userId)} className="p-2 border border-zinc-800 hover:bg-white hover:text-black hover:border-white text-zinc-400 transition-all">
                         <MessageSquare className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
                ))}
                {friends.length === 0 && (
                  <div className="p-8 text-center bg-black">
                     <p className="font-mono text-zinc-600 text-sm">FRIEND LIST EMPTY</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
