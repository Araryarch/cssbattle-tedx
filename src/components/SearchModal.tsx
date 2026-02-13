"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/axios";

type SearchUser = {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
};

type SearchResult = {
  users: SearchUser[];
};

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await api.get<SearchResult>(`/search?q=${encodeURIComponent(query)}`);
        setResults(data.users || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-60 hover:opacity-100 flex items-center gap-2 text-xs text-white/40 border border-white/10 px-3"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
            >
              <div className="bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                  <Search className="w-5 h-5 text-white/40" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search users by name or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none text-sm"
                  />
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5 text-white/40 hover:text-white" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center text-white/40">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : query.length < 2 ? (
                    <div className="p-8 text-center text-white/30 text-sm">
                      Type at least 2 characters to search
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-sm">
                      No users found
                    </div>
                  ) : (
                    <div className="py-2">
                      {results.map((user) => (
                        <Link
                          key={user.id}
                          href={`/profile/${user.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                            {user.image ? (
                              <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-white/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{user.name || "Unnamed User"}</p>
                            <p className="text-xs text-white/40 truncate">{user.email}</p>
                          </div>
                          <MessageCircle className="w-4 h-4 text-white/30" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-white/5 bg-white/[0.02] text-xs text-white/30 flex justify-between">
                  <span>Press <kbd className="bg-white/5 px-1 rounded">Esc</kbd> to close</span>
                  <span>Search users</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
