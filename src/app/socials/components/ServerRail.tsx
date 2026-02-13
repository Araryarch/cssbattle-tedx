import React from "react";
import { Plus, Tv, Compass } from "lucide-react";
import { ServerIcon } from "./ServerIcon";

interface ServerRailProps {
  clans: any[];
  activeServerId: string;
  onServerSwitch: (id: string) => void;
  onShowCreateClanModal: () => void;
  onDiscover: () => void; // New prop
  mobileSidebarOpen: boolean;
}

export const ServerRail: React.FC<ServerRailProps> = ({ 
  clans, 
  activeServerId, 
  onServerSwitch, 
  onShowCreateClanModal,
  onDiscover,
  mobileSidebarOpen 
}) => (
  <nav className={`
    fixed left-0 top-[64px] bottom-0 z-50 w-[72px] bg-black border-r border-white/10 flex flex-col items-center overflow-y-auto no-scrollbar transition-transform duration-200
    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static md:h-full md:z-0'}
  `}>
    <ServerIcon 
      isHome
      icon={Tv} 
      active={activeServerId === 'home'} 
      onClick={() => onServerSwitch("home")}
      name="Home"
    />
    
    <div className="w-full h-[1px] bg-white/10 my-0" />
    
    {clans.map(clan => (
      <ServerIcon
        key={clan.id}
        name={clan.name}
        image={clan.image}
        active={activeServerId === clan.id}
        onClick={() => onServerSwitch(clan.id)}
      />
    ))}

    <button 
      onClick={onShowCreateClanModal}
      className="group w-full aspect-square flex items-center justify-center bg-black hover:bg-white text-zinc-500 hover:text-black border-b border-white/10 transition-colors"
      title="Create Clan"
    >
      <Plus className="w-6 h-6" />
    </button>
    
    <button 
      onClick={onDiscover}
      className="group w-full aspect-square flex items-center justify-center bg-black hover:bg-white text-zinc-500 hover:text-black border-b border-white/10 transition-colors"
      title="Discover Servers"
    >
      <Compass className="w-6 h-6" />
    </button>
  </nav>
);
