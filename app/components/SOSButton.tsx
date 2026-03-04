"use client";

import React, { useState } from "react";
import { useGlobal } from "@/app/context/GlobalContext";

export function SOSButton() {
    const { currentUser } = useGlobal();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [done, setDone] = useState(false);
    const [customMessage, setCustomMessage] = useState("");

    if (!currentUser) return null;

    const handleSOS = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/sos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUser.id,
                    message: customMessage.trim() || `EMERGENCY SOS: ${currentUser.name} (${currentUser.role.toUpperCase()}) needs immediate assistance.`
                })
            });

            if (res.ok) {
                setDone(true);
                setTimeout(() => {
                    setDone(false);
                    setIsConfirming(false);
                    setCustomMessage(""); // Reset message
                }, 3000);
            } else {
                alert("Failed to send SOS. Please check your connection.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred while sending SOS.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsConfirming(true)}
                style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.2s ease',
                    animation: 'pulseSOS 2s infinite'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> SOS EMERGENCY
            </button>

            <style jsx>{`
                @keyframes pulseSOS {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>

            {isConfirming && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{
                        maxWidth: '400px',
                        width: '90%',
                        padding: '30px',
                        textAlign: 'center',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        {done ? (
                            <div style={{ color: '#10b981' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <h3 style={{ margin: '0 0 10px 0' }}>SOS SENT!</h3>
                                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                    Sr. DSTE, DSTE, and respective ADSTE have been notified via Email and SMS.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>CONFIRM EMERGENCY</h3>
                                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
                                    This will immediately notify all higher authorities (Sr. DSTE, DSTE, ADSTE) about your emergency. Proceed only if urgent.
                                </p>

                                {/* Custom Message Input */}
                                <textarea
                                    placeholder="Describe the emergency (optional)..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    disabled={isSending}
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        marginBottom: '20px',
                                        resize: 'vertical',
                                        backgroundColor: 'var(--bg)',
                                        color: 'var(--text)'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setIsConfirming(false);
                                            setCustomMessage("");
                                        }}
                                        disabled={isSending}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            fontWeight: '700'
                                        }}
                                        onClick={handleSOS}
                                        disabled={isSending}
                                    >
                                        {isSending ? "Sending..." : "SEND SOS"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
