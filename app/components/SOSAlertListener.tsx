"use client";

import React, { useEffect, useState } from "react";
import { useGlobal } from "@/app/context/GlobalContext";

interface SOSAlert {
    _id: string; // MongoDB ID
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
}

export function SOSAlertListener() {
    const { currentUser } = useGlobal();
    const [alerts, setAlerts] = useState<SOSAlert[]>([]);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const superiorRoles = ['sr-dste', 'dste', 'adste'];
        if (!superiorRoles.includes(currentUser.role)) return;

        const checkAlerts = async () => {
            try {
                const res = await fetch(`/api/sos?role=${currentUser.role}&teamId=${currentUser.teamId || ""}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out dismissed ones
                    setAlerts(data);
                }
            } catch (e) {
                console.error("Failed to fetch SOS alerts", e);
            }
        };

        checkAlerts();
        const interval = setInterval(checkAlerts, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const activeAlerts = alerts.filter(a => !dismissedIds.includes(a._id || a.id));

    if (activeAlerts.length === 0) return null;

    if (isMinimized) {
        return (
            <div
                onClick={() => setIsMinimized(false)}
                style={{
                    marginBottom: '20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontWeight: 800,
                    animation: 'pulseSOS 2s infinite',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> {activeAlerts.length} EMERGENCY SOS ({activeAlerts.length === 1 ? 'ALERT' : 'ALERTS'}) — CLICK TO EXPAND
            </div>
        );
    }

    return (
        <div style={{
            marginBottom: '20px',
            backgroundColor: '#fff',
            border: '1px solid #fee2e2',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1), 0 8px 10px -6px rgba(239, 68, 68, 0.1)'
        }}>
            <div style={{
                backgroundColor: '#fecaca',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #fca5a5'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'shake 0.5s infinite' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    <strong style={{ color: '#991b1b', letterSpacing: '0.02em' }}>ACTIVE EMERGENCY ALERTS ({activeAlerts.length})</strong>
                </div>
                <button
                    onClick={() => setIsMinimized(true)}
                    title="Minimize"
                    style={{
                        background: '#f87171',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 900,
                        lineHeight: 1,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#ef4444')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#f87171')}
                >
                    −
                </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {activeAlerts.map((alert, index) => (
                    <div
                        key={alert._id || alert.id || index}
                        style={{
                            padding: '16px 20px',
                            borderBottom: index === activeAlerts.length - 1 ? 'none' : '1px solid #fee2e2',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            backgroundColor: index % 2 === 0 ? '#fff' : '#fef2f2'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '15px', color: '#1f2937' }}>
                                    {alert.senderName}
                                    <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '13px', marginLeft: '6px' }}>
                                        ({alert.senderRole.toUpperCase()})
                                    </span>
                                </strong>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                                {alert.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setDismissedIds(prev => [...prev, alert._id || alert.id])}
                            title="Dismiss"
                            style={{
                                background: '#fee2e2',
                                border: 'none',
                                color: '#ef4444',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#fecaca';
                                e.currentTarget.style.transform = 'rotate(90deg)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.transform = 'rotate(0deg)';
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes shake {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    50% { transform: rotate(0eg); }
                    75% { transform: rotate(-5deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes pulseSOS {
                    0% { transform: scale(1); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
                    50% { transform: scale(1.02); box-shadow: 0 4px 25px rgba(239, 68, 68, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
                }
            `}</style>
        </div>
    );
}
