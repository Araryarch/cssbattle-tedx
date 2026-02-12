"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Users, Eye, Radio, Clock, Code2, Maximize2, Minimize2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";

type LiveUser = {
  userId: string;
  userName: string;
  challengeId: string;
  challengeTitle: string;
  contestId?: string;
  code: string;
  lastUpdate: number;
};

export default function SpectatePage() {
  const [activeUsers, setActiveUsers] = useState<LiveUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LiveUser | null>(null);
  const [connected, setConnected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  useEffect(() => {
    const es = new EventSource("/api/live-code/stream");
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "init") {
          // Initial load: set all active users
          setActiveUsers(data.users || []);
        } else if (data.type === "code-update") {
          // Update a specific user's code
          setActiveUsers((prev) => {
            const key = `${data.userId}:${data.challengeId}`;
            const existing = prev.findIndex(
              (u) => `${u.userId}:${u.challengeId}` === key
            );

            const updated: LiveUser = {
              userId: data.userId,
              userName: data.userName,
              challengeId: data.challengeId,
              challengeTitle: data.challengeTitle,
              contestId: data.contestId,
              code: data.code,
              lastUpdate: data.lastUpdate || Date.now(),
            };

            if (existing >= 0) {
              const newArr = [...prev];
              newArr[existing] = updated;
              return newArr;
            }
            return [...prev, updated];
          });

          // Also update selected user if it's the same one
          setSelectedUser((prev) => {
            if (
              prev &&
              prev.userId === data.userId &&
              prev.challengeId === data.challengeId
            ) {
              return {
                ...prev,
                code: data.code,
                lastUpdate: data.lastUpdate || Date.now(),
              };
            }
            return prev;
          });
        } else if (data.type === "active-list") {
          setActiveUsers(data.users || []);
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, []);

  // Preview document for the selected user's code
  const previewDoc = useMemo(() => {
    if (!selectedUser) return "";
    return `<!DOCTYPE html>
<html>
<head>
  <style>body,html{margin:0;padding:0;width:400px;height:300px;overflow:hidden;background:white;}</style>
</head>
<body>${selectedUser.code}</body>
</html>`;
  }, [selectedUser?.code]);

  const formatTimeSince = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 10) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Eye className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Spectate Mode</h1>
            <p className="text-xs text-zinc-500">Watch participants code in real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connected ? "bg-green-500 animate-pulse shadow-[0_0_6px_theme(colors.green.500)]" : "bg-red-500"
            )} />
            <span className={cn(
              "font-bold uppercase tracking-wider",
              connected ? "text-green-500" : "text-red-500"
            )}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-white">{activeUsers.length}</span>
            <span className="text-xs text-zinc-500">active</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* User List Sidebar */}
        <div className={cn(
          "border-r border-white/5 flex flex-col overflow-hidden bg-[#0a0a0c] transition-all",
          expanded ? "w-0 opacity-0" : "w-80"
        )}>
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              Live Participants
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-600 font-bold">No one is coding right now</p>
                <p className="text-xs text-zinc-700 mt-1">Users will appear here when they start coding</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {activeUsers.map((user) => {
                  const isSelected =
                    selectedUser?.userId === user.userId &&
                    selectedUser?.challengeId === user.challengeId;

                  return (
                    <button
                      key={`${user.userId}:${user.challengeId}`}
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        "w-full text-left px-4 py-3 transition-all hover:bg-white/5",
                        isSelected && "bg-primary/10 border-l-2 border-primary"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-white truncate max-w-[140px]">
                            {user.userName}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {formatTimeSince(user.lastUpdate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pl-9">
                        <Code2 className="w-3 h-3 text-zinc-600" />
                        <span className="text-[11px] text-zinc-500 truncate">
                          {user.challengeTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 pl-9 mt-1 text-[10px] text-zinc-600">
                        <span>{user.code.length} chars</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Spectate View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Selected User Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#080808]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {selectedUser.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedUser.userName}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span>{selectedUser.challengeTitle}</span>
                      <span className="w-px h-2 bg-white/10" />
                      <span>{selectedUser.code.length} chars</span>
                      <span className="w-px h-2 bg-white/10" />
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeSince(selectedUser.lastUpdate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                    title={expanded ? "Show sidebar" : "Expand"}
                  >
                    {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    Spectating
                  </div>
                </div>
              </div>

              {/* Code + Preview Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Code Editor (Read-Only) */}
                <div className="w-1/2 flex flex-col border-r border-white/10">
                  <div className="px-4 py-2 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Code2 className="w-3 h-3" /> Code (Read Only)
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      defaultLanguage="html"
                      value={selectedUser.code}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        wordWrap: "on",
                        lineNumbers: "on",
                        folding: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        domReadOnly: true,
                        renderWhitespace: "selection",
                      }}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="w-1/2 flex flex-col">
                  <div className="px-4 py-2 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Live Preview
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-[#050505] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:20px_20px]">
                    <div className="border border-white/10 shadow-2xl">
                      <iframe
                        title="spectate-preview"
                        srcDoc={previewDoc}
                        className="w-[400px] h-[300px] border-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto">
                  <Eye className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-500">Select a participant</h3>
                  <p className="text-sm text-zinc-700 mt-1">
                    Click on a user from the sidebar to spectate their code
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
