import React from "react";
import { LucideIcon } from "lucide-react";

interface ServerIconProps {
  id?: string;
  name?: string;
  image?: string | null;
  active?: boolean;
  onClick?: () => void;
  isHome?: boolean;
  icon?: LucideIcon;
}

export const ServerIcon: React.FC<ServerIconProps> = ({ 
  id, 
  name = "Server", 
  image, 
  active, 
  onClick, 
  isHome, 
  icon: Icon 
}) => (
  <button
    onClick={onClick}
    className={`
      group w-full aspect-square flex items-center justify-center transition-all duration-100 relative
      ${active ? "bg-primary text-white" : "bg-black hover:bg-zinc-900 text-zinc-500 hover:text-primary"}
      border-b border-white/10 last:border-0
    `}
  >
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />
    )}
    
    {isHome && Icon ? (
      <Icon className="w-6 h-6" />
    ) : image ? (
      <img src={image} alt={name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
    ) : (
      <span className="font-mono font-bold text-sm tracking-tighter">
        {name.substring(0, 2).toUpperCase()}
      </span>
    )}
  </button>
);
