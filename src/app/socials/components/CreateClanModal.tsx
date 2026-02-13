import React, { useState } from "react";

interface CreateClanModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateClanModal: React.FC<CreateClanModalProps> = ({ onClose, onCreate }) => {
  const [newClanName, setNewClanName] = useState("");

  return (
    <div className="fixed inset-0 bg-zinc-950/90 flex items-center justify-center z-[100] backdrop-blur-[2px]">
      <div className="bg-black border border-white/20 w-full max-w-md p-0 shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-mono text-white uppercase tracking-wider mb-2">Initialize Server</h2>
          <p className="text-zinc-500 font-mono text-xs">Create a new secure channel for your team.</p>
        </div>
        
        <div className="p-6">
          <label className="block text-xs font-bold font-mono text-zinc-400 uppercase mb-2">Server Designation</label>
          <input 
            className="w-full bg-zinc-900 border border-white/10 p-3 text-white font-mono text-sm focus:border-white outline-none"
            placeholder="MY_SERVER_01"
            value={newClanName}
            onChange={(e) => setNewClanName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="p-4 bg-zinc-900 border-t border-white/10 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white font-mono text-xs uppercase hover:underline"
          >
            Abort
          </button>
          <button 
            onClick={() => onCreate(newClanName)}
            disabled={!newClanName.trim()}
            className="px-6 py-2 bg-primary text-white font-mono text-xs font-bold uppercase hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
