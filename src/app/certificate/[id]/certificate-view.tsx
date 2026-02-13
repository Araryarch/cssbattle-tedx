"use client";

import { useEffect } from "react";
import CertificateContent from "@/components/profile/CertificateContent";

interface CertificateViewProps {
  userId: string;
  userName: string;
  userRank: string;
}

export default function CertificateView({ userId, userName, userRank }: CertificateViewProps) {
  useEffect(() => {
    // Auto print if wanted, or just let them click the button
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        {/* Load fonts for this page */}
        <link href="https://cdn.jsdelivr.net/gh/nextapps-de/jetbrains-mono@1.0.6/css/jetbrains-mono.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/gh/mshaugh/nerdfont-webfonts@v3.2.1/build/build-all.css" rel="stylesheet" />
        
        <style dangerouslySetInnerHTML={{ __html: `
          /* Override the root layout's background */
          html, body { 
            background: #050505 !important; 
            color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            font-family: 'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace !important;
          }
          
          @media print {
            @page {
              size: landscape;
              margin: 0;
            }
            body { 
              padding: 0 !important; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .no-print { display: none !important; }
            .cert-container {
                box-shadow: none !important;
                border: none !important;
                transform: scale(1) !important;
                margin: 0 !important;
            }
          }
        `}} />
        
        <div className="cert-container shadow-[0_40px_100px_rgba(222,41,41,0.15)] border border-white/5 rounded-xl overflow-hidden">
            <CertificateContent 
                userId={userId} 
                userName={userName} 
                userRank={userRank} 
            />
        </div>

        <button 
            className="print-btn no-print fixed bottom-[30px] right-[30px] px-7 py-3.5 bg-red-600 text-white border-none rounded-xl text-[15px] font-bold cursor-pointer shadow-[0_8px_24px_rgba(220,38,38,0.3)] z-50 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
            onClick={() => window.print()}
        >
          Save as PDF / Print
        </button>
    </div>
  );
}
