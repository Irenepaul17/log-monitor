"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useGlobal } from "@/app/context/GlobalContext";
import { useRouter } from "next/navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { currentUser, logout } = useGlobal();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Role-based navigation items
    const getDashboardLink = () => {
        if (!currentUser) return null;

        // Only show user's own dashboard
        const dashboardMap: Record<string, { href: string; label: string }> = {
            'sr-dste': { href: '/dashboard/sr-dste', label: 'Sr. DSTE Dashboard' },
            'dste': { href: '/dashboard/dste', label: 'DSTE Dashboard' },
            'adste': { href: '/dashboard/adste', label: 'ADSTE Dashboard' },
            'sse': { href: '/dashboard/sse', label: 'SSE Dashboard' },
            'je': { href: '/dashboard/je', label: 'JE Dashboard' },
            'technician': { href: '/dashboard/je', label: 'Dashboard' },
        };

        return dashboardMap[currentUser.role];
    };

    const canManageUsers = currentUser && ['sr-dste', 'dste', 'adste'].includes(currentUser.role);

    const dashboardLink = getDashboardLink();

    return (
        <>
            <main style={{ width: '100%', minHeight: '100vh' }}>
                <header style={{
                    padding: '20px 40px',
                    borderBottom: '1px solid var(--border)',
                    background: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    <h1
                        onClick={() => router.push(dashboardLink?.href || '/')}
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            margin: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <span style={{ fontSize: '28px' }}>📑</span>
                        S&T Digital Log
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                {currentUser ? currentUser.name : "Guest"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                                {currentUser ? currentUser.sub : "Please Login"}
                            </div>
                        </div>

                        {/* Avatar with Dropdown */}
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "var(--primary-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--primary)",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    border: 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {currentUser ? currentUser.name.charAt(0) : "?"}
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid var(--border)',
                                    minWidth: '200px',
                                    zIndex: 1000,
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            router.push(dashboardLink?.href || '/');
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '14px',
                                            color: 'var(--text)',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: '18px' }}>🏠</span>
                                        Dashboard Home
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            router.push('/profile');
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '14px',
                                            color: 'var(--text)',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: '18px' }}>👤</span>
                                        View Profile
                                    </button>

                                    {currentUser && currentUser.role !== 'technician' && (
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                router.push('/hierarchy');
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: 'none',
                                                background: 'transparent',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: '14px',
                                                color: 'var(--text)',
                                                borderBottom: '1px solid var(--border)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontSize: '18px' }}>👥</span>
                                            My Section / Team
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            logout();
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '14px',
                                            color: '#ef4444',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: '18px' }}>🚪</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div style={{ padding: '40px', minHeight: 'calc(100vh - 140px)' }}>
                    {children}
                </div>
                {/* Version Footer */}
                <footer style={{
                    padding: '16px 40px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--muted)',
                    marginTop: 'auto'
                }}>
                    S&T Digital Log Book v1.0.0 | © 2026 Indian Railways
                </footer>
            </main>
        </>
    );
}
