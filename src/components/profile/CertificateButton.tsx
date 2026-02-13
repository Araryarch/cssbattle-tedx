"use client";

import { useState, useEffect } from "react";
import { Medal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CertificateContent from "./CertificateContent";

interface CertificateButtonProps {
    user: {
        id: string;
        name: string | null;
        rank: string | null;
    };
    className?: string;
    children?: React.ReactNode;
}

export default function CertificateButton({ user, className, children }: CertificateButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [scale, setScale] = useState(0.8);

    useEffect(() => {
        if (!isOpen) return;
        
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Base certificate size is 854x480
            const scaleW = (width * 0.9) / 854;
            const scaleH = (height * 0.7) / 480;
            
            let newScale = Math.min(scaleW, scaleH);
            if (newScale > 1) newScale = 1;
            setScale(newScale);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    const eligibleRanks = ["dev", "1grid", "1flex", "2flex", "3flex", "4flex"];
    const isEligible = user.rank && eligibleRanks.includes(user.rank);

    if (!isEligible) return null;

    const handleDownload = () => {
        window.open(`/certificate/${user.id}`, '_blank');
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={cn(
                    "px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:from-yellow-500 hover:to-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-900/20",
                    className
                )}
            >
                {children || (
                    <>
                        <Medal className="w-4 h-4" /> Certificate
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden" onClick={() => setIsOpen(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative flex flex-col items-center justify-center w-full h-full p-4"
                        >
                             <div className="absolute top-4 right-4 z-50 flex gap-3 items-center">
                                 <button 
                                    onClick={handleDownload}
                                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95"
                                 >
                                    Save as PDF
                                 </button>
                                 <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                 >
                                     <X className="w-8 h-8" />
                                 </button>
                             </div>

                            <div 
                                className="shadow-2xl shadow-black/50 overflow-hidden rounded-sm"
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'center center'
                                }}
                            >
                                <CertificateContent 
                                    userId={user.id} 
                                    userName={user.name || "User"} 
                                    userRank={user.rank || "8flex"} 
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
