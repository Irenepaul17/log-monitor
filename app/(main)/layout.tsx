"use client";

import Link from "next/link";
import { useState, useRef, useEffect, Suspense, ReactNode } from "react";
import { useGlobal } from "@/app/context/GlobalContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading structure...</div>}>
            <MainLayoutContent>{children}</MainLayoutContent>
        </Suspense>
    );
}

function MainLayoutContent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { currentUser, logout } = useGlobal();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logsExpanded, setLogsExpanded] = useState(false);
    const [failuresExpanded, setFailuresExpanded] = useState(false);
    const [counts, setCounts] = useState<{
        totals: { workLogs: number; openFailures: number },
        monthCounts: { workLogs: Record<string, number>; failures: Record<string, number> }
    }>({
        totals: { workLogs: 0, openFailures: 0 },
        monthCounts: { workLogs: {}, failures: {} }
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get('month');

    // Fetch Dashboard Summary
    useEffect(() => {
        if (!currentUser) return;

        const fetchSummary = async () => {
            try {
                const res = await fetch(`/api/dashboard/summary?userId=${currentUser.id}&role=${currentUser.role}`);
                if (res.ok) {
                    const data = await res.json();
                    setCounts(data);
                }
            } catch (e) {
                console.error("Failed to fetch dashboard summary", e);
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 60000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Auto-expand and highlight logic
    useEffect(() => {
        if (pathname.startsWith('/logs')) setLogsExpanded(true);
        if (pathname.startsWith('/failures')) setFailuresExpanded(true);
    }, [pathname]);

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

    const generateLastMonths = (count = 12) => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < count; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const monthStr = `${year}-${month}`;
            const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            months.push({ value: monthStr, label });
        }
        return months;
    };

    const monthLinks = generateLastMonths();

    // Role-based navigation items
    const getDashboardLink = () => {
        if (!currentUser) return null;
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

    const dashboardLink = getDashboardLink();
    if (!currentUser) return null;

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <span style={{ fontSize: '24px' }}>📑</span>
                    Log Monitor
                </div>

                <style jsx>{`
                    .sidebar-month-link:hover {
                        background: rgba(0, 0, 0, 0.03);
                        border-radius: 8px;
                    }
                    .nav-item.active .sidebar-month-link:hover {
                        background: transparent;
                    }
                `}</style>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    <Link
                        href={dashboardLink?.href || '/'}
                        className={`nav-item ${pathname.includes('/dashboard') ? 'active' : ''}`}
                    >
                        <span>🏠</span> Dashboard
                    </Link>

                    {/* Work Logs Section */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            className="nav-item"
                            onClick={() => setLogsExpanded(!logsExpanded)}
                            style={{ justifyContent: 'space-between' }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span>📋</span> Work Logs
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {counts.totals.workLogs > 0 && (
                                    <span style={{
                                        background: 'var(--primary-soft)',
                                        color: 'var(--primary)',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '10px'
                                    }}>
                                        {counts.totals.workLogs}
                                    </span>
                                )}
                                <span style={{
                                    transform: logsExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    fontSize: '10px'
                                }}>▶</span>
                            </div>
                        </button>

                        {logsExpanded && (
                            <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>
                                {monthLinks.map(m => {
                                    const count = counts.monthCounts.workLogs[m.value] || 0;
                                    return (
                                        <Link
                                            key={m.value}
                                            href={`/logs?month=${m.value}`}
                                            className={`nav-item sidebar-month-link ${pathname === '/logs' && currentMonth === m.value ? 'active' : ''}`}
                                            style={{ fontSize: '13px', padding: '8px 12px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <span>{m.label}</span>
                                                <div style={{ width: '40px', textAlign: 'right' }}>
                                                    {count > 0 && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            background: '#dbeafe', // bg-blue-100
                                                            color: '#1d4ed8',      // text-blue-700
                                                            fontWeight: 700,
                                                            padding: '2px 8px',
                                                            borderRadius: '9999px' // rounded-full
                                                        }}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Failures Section */}
                    <div style={{ marginTop: '8px' }}>
                        <button
                            className="nav-item"
                            onClick={() => setFailuresExpanded(!failuresExpanded)}
                            style={{ justifyContent: 'space-between' }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span>⚠️</span> Failure Reports
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {counts.totals.openFailures > 0 && (
                                    <span style={{
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '10px'
                                    }}>
                                        {counts.totals.openFailures}
                                    </span>
                                )}
                                <span style={{
                                    transform: failuresExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    fontSize: '10px'
                                }}>▶</span>
                            </div>
                        </button>

                        {failuresExpanded && (
                            <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>
                                {monthLinks.map(m => {
                                    const count = counts.monthCounts.failures[m.value] || 0;
                                    return (
                                        <Link
                                            key={m.value}
                                            href={`/failures?month=${m.value}`}
                                            className={`nav-item sidebar-month-link ${pathname === '/failures' && currentMonth === m.value ? 'active' : ''}`}
                                            style={{ fontSize: '13px', padding: '8px 12px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <span>{m.label}</span>
                                                <div style={{ width: '40px', textAlign: 'right' }}>
                                                    {count > 0 && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            background: '#fee2e2', // bg-red-100
                                                            color: '#b91c1c',      // text-red-700
                                                            fontWeight: 700,
                                                            padding: '2px 8px',
                                                            borderRadius: '9999px' // rounded-full
                                                        }}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/hierarchy"
                        className={`nav-item ${pathname === '/hierarchy' ? 'active' : ''}`}
                        style={{ marginTop: '20px' }}
                    >
                        <span>👥</span> My Section
                    </Link>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={logout}
                        className="nav-item"
                        style={{ color: 'var(--danger)' }}
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-wrapper" style={{ padding: 0 }}>
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
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'var(--text)',
                            margin: 0,
                            cursor: 'pointer'
                        }}
                    >
                        {pathname.startsWith('/logs') ? 'Work Logs' :
                            pathname.startsWith('/failures') ? 'Failure Reports' :
                                pathname.includes('/dashboard') ? (getDashboardLink()?.label || 'Dashboard') :
                                    pathname.includes('/hierarchy') ? 'My Section / Team' :
                                        'Log Monitor'}
                        {currentMonth && <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '12px' }}>— {monthLinks.find(m => m.value === currentMonth)?.label}</span>}
                    </h1>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                {currentUser.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                                {currentUser.sub}
                            </div>
                        </div>

                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: "var(--primary-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--primary)",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    border: 'none'
                                }}
                            >
                                {currentUser.name.charAt(0)}
                            </button>

                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '45px',
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid var(--border)',
                                    minWidth: '180px',
                                    zIndex: 1000,
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                                        className="nav-item"
                                        style={{ borderRadius: 0, marginBottom: 0, borderBottom: '1px solid var(--border)' }}
                                    >
                                        <span>👤</span> Profile
                                    </button>
                                    <button
                                        onClick={() => { setDropdownOpen(false); logout(); }}
                                        className="nav-item"
                                        style={{ borderRadius: 0, marginBottom: 0, color: 'var(--danger)' }}
                                    >
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div style={{ padding: '40px', minHeight: 'calc(100vh - 80px)' }}>
                    {children}
                </div>

                <div style={{
                    position: 'fixed',
                    bottom: '5px',
                    right: '5px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#64748b',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    fontFamily: 'monospace'
                }}>
                    Version 1.2.0
                </div>
            </main>
        </div>
    );
}
