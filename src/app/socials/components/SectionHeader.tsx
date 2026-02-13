import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, actions }) => (
  <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-black select-none flex-shrink-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
      <span className="font-mono font-bold text-sm text-zinc-200 uppercase tracking-widest">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      {actions}
    </div>
  </div>
);
