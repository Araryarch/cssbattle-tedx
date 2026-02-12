"use client";

import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-white/40 text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg">
            <Zap className="w-4 h-4 text-primary fill-current" />
          </div>
          <span className="font-bold tracking-widest text-white uppercase">
            TEDxCSS
          </span>
        </div>
        <p className="font-mono text-xs">
          © 2024 TEDx Engineering. All rights reserved.
        </p>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-wider">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
