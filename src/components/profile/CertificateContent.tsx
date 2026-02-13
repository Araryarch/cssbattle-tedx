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
        height: '600px',
        backgroundColor: '#0a0a0c',
        color: '#ffffff',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
        userSelect: 'none',
        border: '1px solid rgba(255,255,255,0.1)',
    }}>
        {/* Background Pattern - Technical Mesh */}
        <div style={{
            position: 'absolute', 
            inset: 0, 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(220, 38, 38, 0.05) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            opacity: 0.5, 
            zIndex: 0, 
        }}></div>

        {/* Global Glows */}
        <div style={{position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1}}></div>
        <div style={{position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1}}></div>

        {/* Decorative Borders */}
        <div style={{position: 'absolute', inset: '24px', border: '1px solid rgba(255,255,255,0.05)', zIndex: 10, pointerEvents: 'none'}}></div>
        <div style={{position: 'absolute', inset: '16px', border: '1px solid rgba(220,38,38,0.2)', zIndex: 10, pointerEvents: 'none'}}></div>
        
        {/* Corner Brackets */}
        <div style={{position: 'absolute', top: '16px', left: '16px', width: '48px', height: '48px', borderTop: '4px solid #dc2626', borderLeft: '4px solid #dc2626', zIndex: 20}}></div>
        <div style={{position: 'absolute', top: '16px', right: '16px', width: '48px', height: '48px', borderTop: '4px solid #dc2626', borderRight: '4px solid #dc2626', zIndex: 20}}></div>
        <div style={{position: 'absolute', bottom: '16px', left: '16px', width: '48px', height: '48px', borderBottom: '4px solid #dc2626', borderLeft: '4px solid #dc2626', zIndex: 20}}></div>
        <div style={{position: 'absolute', bottom: '16px', right: '16px', width: '48px', height: '48px', borderBottom: '4px solid #dc2626', borderRight: '4px solid #dc2626', zIndex: 20}}></div>

        {/* Content Wrapper */}
        <div style={{
            position: 'relative', 
            zIndex: 30, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '40px 70px 30px',
        }}>
            {/* Top Toolbar Info */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline',
                marginBottom: '30px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '16px'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontWeight: 900, letterSpacing: '0.15em', fontSize: '14px', color: '#dc2626'}}>STYLEWARS</span>
                </div>
                <div style={{color: '#71717a', fontSize: '10px'}}>
                   UUID: {userId.toUpperCase()}
                </div>
            </div>

            {/* Main Center Body */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '10px 0'
            }}>
                <div style={{marginBottom: '10px'}}>
                    <span style={{
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        color: '#dc2626', 
                        letterSpacing: '0.4em', 
                        textTransform: 'uppercase',
                        backgroundColor: 'rgba(220,38,38,0.12)',
                        padding: '6px 16px',
                        borderRadius: '2px'
                    }}>RECOGNITION OF EXCELLENCE</span>
                </div>
                
                <h1 style={{
                    fontSize: '68px',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: '#ffffff',
                    margin: '10px 0',
                    textShadow: '0 0 30px rgba(222,41,41,0.5)',
                    fontFamily: 'Cinzel, serif'
                }}>CERTIFICATE</h1>

                <div style={{
                    width: '120px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #dc2626, transparent)',
                    marginBottom: '30px'
                }}></div>

                <p style={{
                    fontSize: '16px',
                    color: '#71717a',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    fontFamily: 'serif'
                }}>This honorary document is proudly presented to</p>

                <div style={{marginBottom: '25px', position: 'relative'}}>
                    <h2 style={{
                        fontSize: '56px',
                        fontWeight: 900,
                        color: '#ffffff',
                        letterSpacing: '0.05em',
                        padding: '0 24px',
                        fontFamily: "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
                    }}>{userName.toUpperCase()}</h2>
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '0',
                        right: '0',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(222,41,41,1), transparent)'
                    }}></div>
                </div>

                <p style={{
                    fontSize: '11px',
                    color: '#a1a1aa',
                    lineHeight: '1.8',
                    maxWidth: '560px',
                    letterSpacing: '0.05em'
                }}>
                    For demonstrating superior technical proficiency and artistic mastery in the field of 
                    <span style={{color: '#ffffff', fontWeight: 'bold'}}> CSS_ARCHITECTURE </span> 
                    and reaching the elite rank of <span style={{color: '#dc2626', fontWeight: 'bold'}}>{userRank.toUpperCase()}</span>.
                </p>
            </div>

            {/* Bottom Section: Rank Badge & Verification */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '20px'
            }}>
                <div style={{textAlign: 'left'}}>
                    <div style={{fontSize: '9px', color: '#71717a', marginBottom: '6px', letterSpacing: '0.1em'}}>DATE ISSUED</div>
                    <div style={{fontSize: '14px', fontWeight: 'bold', color: '#ffffff'}}>{today}</div>
                </div>

                {/* The Big Rank Badge */}
                <div style={{
                    padding: '12px 48px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                    clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 15px 35px rgba(220,38,38,0.4)',
                    border: '1px solid rgba(255,255,255,0.4)',
                }}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em'}}>RANK ACHIEVED</span>
                    <span style={{fontSize: '36px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.15em', lineHeight: 1}}>{userRank.toUpperCase()}</span>
                </div>

                <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '9px', color: '#dc2626', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '6px'}}>SECURE_VERIFY_OK</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', justifyContent: 'flex-end'}}>
                        AUTHENTICATED
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
