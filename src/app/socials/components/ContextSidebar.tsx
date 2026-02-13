import React from "react";
import { Users, Hash, Plus, Mic, Settings, Volume2, Signal, PhoneOff } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

interface ContextSidebarProps {
  activeServerId: string;
  activeChannelId: string;
  activeClan: any;
  handleChannelSwitch: (id: string) => void;
  conversations: any[]; // Replace with proper type
  mobileSidebarOpen: boolean;
  user: any;
  voiceParticipants: any[];
  joinVoice: (channelId: string) => void;
  leaveVoice: () => void;
  connectedVoiceChannelId: string | null;
}

export const ContextSidebar: React.FC<ContextSidebarProps> = ({
  activeServerId,
  activeChannelId,
  activeClan,
  handleChannelSwitch,
  conversations,
  mobileSidebarOpen,
  user,
  voiceParticipants,
  joinVoice,
  leaveVoice,
  connectedVoiceChannelId
}) => {
  return (
    <div className={`
        fixed md:static z-40 w-64 bg-zinc-950 flex flex-col border-r border-white/10
        ${mobileSidebarOpen ? 'translate-x-[72px]' : '-translate-x-full md:translate-x-0 h-full'}
        transition-transform duration-200
      `}>
        
        {/* Header */}
        <div className="h-12 flex items-center px-4 border-b border-white/10 bg-zinc-950 flex-shrink-0">
           {activeServerId === "home" ? (
             <div className="w-full bg-zinc-900 border border-white/10 px-2 py-1 text-xs font-mono text-zinc-500 uppercase tracking-wider">
               Network Index
             </div>
           ) : (
             <div className="font-mono font-bold text-sm text-white truncate w-full uppercase tracking-wider">{activeClan?.name}</div>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
          {activeServerId === "home" ? (
            <>
              {/* Main Nav */}
              <div className="p-3 space-y-1 border-b border-white/5">
                {[
                  { id: 'friends', icon: Users, label: 'Friends' },
                  { id: 'global', icon: Hash, label: 'Global Net' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleChannelSwitch(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-sm font-mono transition-colors
                      ${activeChannelId === item.id 
                        ? 'bg-primary text-white font-bold' 
                        : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
              
              {/* DMs */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                    Direct Connections
                  </span>
                  <button onClick={() => handleChannelSwitch('add')} className="text-zinc-600 hover:text-white transition-colors">
                      <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {conversations.map(conv => (
                     <button
                      key={conv.id}
                       onClick={() => handleChannelSwitch(conv.userId)}
                       className={`
                         w-full flex items-center gap-3 px-2 py-2 group border border-transparent transition-all
                         ${activeChannelId === conv.userId 
                           ? 'bg-zinc-900 border-white/10 text-white' 
                           : 'hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                         }
                       `}
                     >
                       <UserAvatar src={conv.image} name={conv.name} className="w-6 h-6 border-0" />
                       <span className="text-xs font-mono truncate flex-1 text-left">{conv.name || "User"}</span>
                     </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-3">
              <div className="mb-2 px-1 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                 Text Channels
              </div>
              <button 
                 onClick={() => handleChannelSwitch("general")}
                 className={`
                   w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors border border-transparent mb-4
                   ${activeChannelId === 'general' 
                    ? 'bg-primary text-white font-bold' 
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                   }
                 `}
              >
                <Hash className="w-4 h-4" />
                <span>general</span>
              </button>

              <div className="mb-2 px-1 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                 Voice Channels
              </div>
              <div className="space-y-1 mb-4">
                 {['Lobby', 'Gaming', 'General Voice'].map(vChannel => (
                   <div key={vChannel} className="group">
                      <button 
                         onClick={() => joinVoice(vChannel)}
                         className={`
                           w-full flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors border border-transparent
                           ${activeChannelId === vChannel 
                             ? 'bg-zinc-800 text-white font-bold' 
                             : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                           }
                         `}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{vChannel}</span>
                      </button>
                      <div className="pl-9 pr-2 pb-1 space-y-1">
                         {voiceParticipants.filter(p => p.channelId === vChannel).map(p => (
                           <div key={p.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-white/5 cursor-pointer">
                              <UserAvatar src={p.image} name={p.name} className="w-5 h-5" fallbackClassName="text-[10px]" />
                              <span className="text-xs font-mono text-zinc-400 truncate max-w-[100px]">{p.name}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Voice Connection Panel */}
        {connectedVoiceChannelId && (
           <div className="bg-zinc-900/80 border-t border-white/5 p-2 pb-3 mb-0 flex-shrink-0">
              <div className="flex items-center justify-between px-1 mb-1">
                 <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-bold uppercase tracking-widest">
                    <Signal className="w-3 h-3" />
                    Voice Connected
                 </div>
              </div>
              <div className="flex items-center justify-between bg-black border border-white/10 rounded p-2">
                 <div className="min-w-0">
                    <div className="font-bold font-mono text-white text-xs truncate max-w-[100px]">
                       {connectedVoiceChannelId}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                       <span className="text-green-500">●</span> {activeClan?.name}
                    </div>
                 </div>
                 <button onClick={leaveVoice} className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <PhoneOff className="w-4 h-4" />
                 </button>
              </div>
           </div>
        )}

        {/* User Bar */}
        <div className="h-14 bg-black border-t border-white/10 flex items-center px-3 gap-3 flex-shrink-0">
          <UserAvatar src={user.image} name={user.name} className="w-8 h-8" />
          <div className="flex-1 min-w-0">
             <div className="text-xs font-bold font-mono text-white truncate uppercase">{user.name}</div>
             <div className="text-[10px] font-mono text-zinc-600 truncate">ID: {user.id.substring(0,6)}</div>
          </div>
        </div>
      </div>
  );
};
