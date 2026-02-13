import { useEffect } from "react";
import CertificateContent from "@/components/profile/CertificateContent";

interface CertificateViewProps {
  userId: string;
  userName: string;
  userRank: string;
}

export default function CertificateView({ userId, userName, userRank }: CertificateViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000); // Give fonts a bit more time to load
    return () => clearTimeout(timer);
  }, []);

  return (
    <html>
      <head>
        <title>Certificate - {userName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @media print {
            body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          body { 
            background: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 14px 28px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
            z-index: 100;
            transition: all 0.2s;
          }
          .print-btn:hover {
            background: #b91c1c;
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(220, 38, 38, 0.4);
          }
        `}</style>
      </head>
      <body>
        <CertificateContent 
            userId={userId} 
            userName={userName} 
            userRank={userRank} 
        />

        <button className="print-btn no-print" onClick={() => window.print()}>
          Save as PDF / Print
        </button>
      </body>
    </html>
  );
}
