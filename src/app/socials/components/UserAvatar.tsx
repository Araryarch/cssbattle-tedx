import React from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  status?: "online" | "offline" | "dnd" | "idle";
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  name, 
  className = "w-8 h-8", 
  fallbackClassName = "text-sm", 
  status 
}) => (
  <div className={`relative ${className} bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
    {src ? (
      <img src={src} alt={name || "User"} className="w-full h-full object-cover" />
    ) : (
      <span className={`text-zinc-400 font-mono font-bold ${fallbackClassName}`}>
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    )}
    {status === 'online' && (
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary border border-black transform translate-x-1/2 translate-y-1/2" />
    )}
  </div>
);
