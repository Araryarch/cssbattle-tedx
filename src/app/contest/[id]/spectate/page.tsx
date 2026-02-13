"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Code, User, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveSession {
    userId: string;
    userName: string;
    challengeId: string;
    challengeTitle: string;
    code: string;
    contestId?: string;
    lastUpdate: number;
}

export default function ContestSpectatePage() {
    const params = useParams();
    const contestId = params.id as string;
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const eventSource = new EventSource("/api/live-code/stream");

        eventSource.onmessage = (event) => {
            try {
                // Ignore empty or heartbeat messages
                if (!event.data || event.data.startsWith(":")) return;

                const data = JSON.parse(event.data);

                if (data.type === "init" || data.type === "active-list") {
                    const active = (data.users || []) as LiveSession[];
                    // Filter: Only include sessions for this contest
                    const contestSessions = active.filter(s => s.contestId === contestId);
                    setSessions(contestSessions);
                    setIsLoading(false);
                } else if (data.type === "code-update") {
                    const session = data as LiveSession;
                    
                    // Only update if relevant to this contest
                    if (session.contestId === contestId) {
                        setSessions(prev => {
                            // Replace existing entry for user+challenge, or add new
                            const others = prev.filter(p => !(p.userId === session.userId && p.challengeId === session.challengeId));
                            return [session, ...others];
                        });
                    }
                }
            } catch (err) {
                console.error("SSE Error", err);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection Error", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [contestId]);

    return (
        <div className="min-h-screen bg-black text-white p-6">
             {/* Header */}
             <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/contest/${contestId}`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Contest
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Tv className="w-5 h-5 text-red-500 animate-pulse" />
                        Live Spectator
                    </h1>
                </div>
                
                <div className="text-zinc-500 text-sm font-mono">
                    {sessions.length} active coders
                </div>
             </div>

             {/* Grid */}
             <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {isLoading ? (
                     <div className="col-span-full text-center py-20 text-zinc-600 animate-pulse">
                         Connecting to live stream...
                     </div>
                 ) : sessions.length === 0 ? (
                     <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
                         <Code className="w-12 h-12 opacity-20" />
                         <p>Waiting for participants to start coding...</p>
                     </div>
                 ) : (
                     sessions.map(session => (
                         <Session key={`${session.userId}-${session.challengeId}`} session={session} />
                     ))
                 )}
             </div>
        </div>
    );
}

function Session({ session }: { session: LiveSession }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5); // Initial lower scale

    useEffect(() => {
        if (!containerRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = Math.floor(entry.contentRect.width);
                const newScale = width / 400;
                setScale(newScale);
            }
        });
        
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Generate preview srcDoc
    const srcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { box-sizing: border-box; }
            body, html { 
                margin: 0; 
                padding: 0; 
                width: 400px; 
                height: 300px; 
                overflow: hidden; 
                background: white;
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
            body::-webkit-scrollbar {
                display: none; /* Chrome, Safari and Opera */
            }
          </style>
        </head>
        <body>${session.code}</body>
      </html>
    `;

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-lg hover:border-white/30 transition-all duration-300 group">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold text-xs text-zinc-300 truncate">{session.userName}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[100px] text-right" title={session.challengeTitle}>
                    {session.challengeTitle}
                </span>
            </div>

            {/* Preview Area */}
            <div ref={containerRef} className="aspect-[4/3] bg-white w-full overflow-hidden relative">
                <div 
                    className="absolute top-0 left-0 w-[400px] h-[300px] pointer-events-none select-none"
                    style={{ 
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                    }}
                >
                     <iframe 
                        title={`Preview ${session.userName}`}
                        className="w-[400px] h-[300px] border-none"
                        srcDoc={srcDoc}
                     />
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        {session.code.length} chars
                    </span>
                </div>
            </div>
        </div>
    );
}
