"use client";

import { Medal } from "lucide-react";

interface CertificateContentProps {
  userId: string;
  userName: string;
  userRank: string;
}

export default function CertificateContent({ userId, userName, userRank }: CertificateContentProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{
        width: '854px',
        height: '480px',
        backgroundColor: '#ffffff',
        color: '#000000',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'serif',
        userSelect: 'none',
    }}>
        {/* Border Frame */}
        <div style={{position: 'absolute', inset: '16px', border: '1px solid #e5e5e5', zIndex: 20, pointerEvents: 'none'}}></div>
        <div style={{position: 'absolute', inset: '24px', border: '3px solid #000000', zIndex: 20, pointerEvents: 'none'}}></div>
        
        {/* Corner Accents */}
        <div style={{position: 'absolute', top: '24px', left: '24px', width: '16px', height: '16px', backgroundColor: '#000000', zIndex: 30}}></div>
        <div style={{position: 'absolute', top: '24px', right: '24px', width: '16px', height: '16px', backgroundColor: '#000000', zIndex: 30}}></div>
        <div style={{position: 'absolute', bottom: '24px', left: '24px', width: '16px', height: '16px', backgroundColor: '#000000', zIndex: 30}}></div>
        <div style={{position: 'absolute', bottom: '24px', right: '24px', width: '16px', height: '16px', backgroundColor: '#000000', zIndex: 30}}></div>
        
        {/* Background Pattern */}
        <div style={{
            position: 'absolute', 
            inset: 0, 
            backgroundImage: "url('https://www.transparenttextures.com/patterns/subtle-grey.png')", 
            opacity: 0.2, 
            zIndex: 0, 
            backgroundColor: '#ffffff'
        }}></div>

        {/* Content */}
        <div style={{
            position: 'relative', 
            zIndex: 20, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px 80px', 
            textAlign: 'center', 
            height: '100%'
        }}>
            
            {/* Header - Platform Info */}
            <div style={{
                marginBottom: '24px', 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                borderBottom: '1px solid rgba(0,0,0,0.1)', 
                paddingBottom: '16px'
            }}>
                <div style={{textAlign: 'left'}}>
                    <div style={{fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.2em', color: '#71717a', marginBottom: '4px', fontFamily: 'JetBrains Mono, monospace'}}>STYLEWARS</div>
                    <div style={{fontWeight: 'bold', fontSize: '18px', color: '#000000', fontFamily: 'JetBrains Mono, monospace'}}>CSSBattle Platform</div>
                </div>
                <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.2em', color: '#71717a', marginBottom: '4px', fontFamily: 'JetBrains Mono, monospace'}}>ID: {userId.slice(0, 8)}</div>
                    <div style={{fontWeight: 'bold', color: '#16a34a', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>OFFICIAL</div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '32px'
            }}>
                <h2 style={{fontWeight: 900, fontSize: '48px', letterSpacing: '0.2em', color: '#000000', marginBottom: '8px', fontFamily: 'Cinzel, serif'}}>CERTIFICATE</h2>
                <p style={{
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5em', 
                    color: '#dc2626', 
                    marginBottom: '32px', 
                    backgroundColor: '#fef2f2', 
                    padding: '4px 16px', 
                    borderRadius: '4px', 
                    fontFamily: 'JetBrains Mono, monospace'
                }}>Of Achievement</p>
                
                <p style={{fontFamily: 'serif', fontStyle: 'italic', fontSize: '24px', color: '#71717a', marginBottom: '8px'}}>This is to certify that</p>
                
                <div style={{marginBottom: '24px'}}>
                    <h1 style={{
                        fontWeight: 900, 
                        fontSize: '48px', 
                        color: '#000000', 
                        position: 'relative', 
                        zIndex: 10, 
                        padding: '8px 32px', 
                        borderTop: '2px solid rgba(0,0,0,0.05)', 
                        borderBottom: '2px solid rgba(0,0,0,0.05)', 
                        fontFamily: 'Cinzel, serif'
                    }}>{userName || "Unknown_User"}</h1>
                </div>
                
                <p style={{
                    color: '#52525b', 
                    maxWidth: '400px', 
                    fontSize: '10px', 
                    lineHeight: 1.6, 
                    marginBottom: '24px', 
                    fontWeight: 500, 
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    has successfully demonstrated exceptional CSS coding skills and achieved the rank of <strong>{userRank}</strong> on the StyleWars CSSBattle platform.
                </p>
                
                {/* Rank Badge */}
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        border: '2px solid #000000', 
                        padding: '8px 24px', 
                        backgroundColor: '#000000', 
                        color: '#ffffff', 
                        position: 'relative', 
                        boxShadow: '4px 4px 0px #dc2626'
                    }}>
                        <span style={{fontSize: '10px', color: '#a1a1aa', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: 'JetBrains Mono, monospace'}}>ACHIEVED RANK</span>
                        <span style={{fontWeight: 'bold', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace'}}>{userRank}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                width: '100%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end', 
                borderTop: '1px solid rgba(0,0,0,0.1)', 
                paddingTop: '16px'
            }}>
                <div style={{textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#71717a'}}>
                    <div>ISSUED BY</div>
                    <div style={{color: '#000000', fontWeight: 'bold', marginTop: '4px'}}>StyleWars Official</div>
                </div>
                <div style={{textAlign: 'center', opacity: 0.3}}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/>
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                </div>
                <div style={{textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#71717a'}}>
                    <div>DATE</div>
                    <div style={{color: '#000000', fontWeight: 'bold', marginTop: '4px'}}>{today}</div>
                </div>
            </div>
        </div>
    </div>
  );
}
