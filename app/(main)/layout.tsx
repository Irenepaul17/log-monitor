"use client";

import Link from "next/link";
import { useState, useRef, useEffect, Suspense, memo, useCallback, useMemo } from "react";
import { useGlobal } from "@/app/context/GlobalContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    AlertTriangle,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    User,
    Menu,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   StablePageContent — memo'd so the page never re-renders when
   sidebar state changes. children from Next.js router is a stable
   reference between layout-internal state changes.
───────────────────────────────────────────────────────────── */
const StablePageContent = memo(function StablePageContent({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ padding: "40px", minHeight: "calc(100vh - 60px)" }}>
            {children}
        </div>
    );
});

/* ─────────────────────────────────────────────────────────────
   Root layout — thin wrapper adding Suspense for useSearchParams
───────────────────────────────────────────────────────────── */
export default function MainLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>}>
            <MainLayoutContent>{children}</MainLayoutContent>
        </Suspense>
    );
}

/* ─────────────────────────────────────────────────────────────
   Main layout — single component, safe and stable
───────────────────────────────────────────────────────────── */
function MainLayoutContent({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const { currentUser, logout } = useGlobal();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [logsExpanded, setLogsExpanded] = useState(false);
    const [failuresExpanded, setFailuresExpanded] = useState(false);
    const [counts, setCounts] = useState<{
        totals: { workLogs: number; openFailures: number };
        monthCounts: { workLogs: Record<string, number>; failures: Record<string, number> };
    }>({
        totals: { workLogs: 0, openFailures: 0 },
        monthCounts: { workLogs: {}, failures: {} },
    });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get("month");

    // Sync sidebar width CSS var (drives main margin without touching React state)
    useEffect(() => {
        document.documentElement.style.setProperty("--sb-w", sidebarOpen ? "240px" : "64px");
    }, [sidebarOpen]);

    // Dashboard summary polling
    useEffect(() => {
        if (!currentUser) return;
        const fetchSummary = async () => {
            try {
                const res = await fetch(
                    `/api/dashboard/summary?userId=${currentUser.id}&role=${currentUser.role}`
                );
                if (res.ok) setCounts(await res.json());
            } catch { /* silent */ }
        };
        fetchSummary();
        const interval = setInterval(fetchSummary, 60000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Auto-expand sidebar sections on relevant routes
    useEffect(() => {
        if (pathname.startsWith("/logs")) setLogsExpanded(true);
        if (pathname.startsWith("/failures")) setFailuresExpanded(true);
        setMobileSidebarOpen(false);
    }, [pathname]);

    // Dropdown close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Memoised stable values — avoids recreating on every render
    const monthLinks = useMemo(() => {
        const out: { value: string; label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            out.push({
                value: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`,
                label: d.toLocaleString("default", { month: "long", year: "numeric" }),
            });
        }
        return out;
    }, []);

    const dashboardLink = useMemo(() => {
        if (!currentUser) return null;
        const map: Record<string, { href: string; label: string }> = {
            "sr-dste": { href: "/dashboard/sr-dste", label: "Sr. DSTE Dashboard" },
            dste: { href: "/dashboard/dste", label: "DSTE Dashboard" },
            adste: { href: "/dashboard/adste", label: "ADSTE Dashboard" },
            sse: { href: "/dashboard/sse", label: "SSE Dashboard" },
            je: { href: "/dashboard/je", label: "JE Dashboard" },
            technician: { href: "/dashboard/je", label: "Dashboard" },
        };
        return map[currentUser.role] ?? null;
    }, [currentUser]);

    const monthLabel = useMemo(
        () => monthLinks.find(m => m.value === currentMonth)?.label,
        [monthLinks, currentMonth]
    );

    // Stable toggle callbacks
    const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), []);
    const toggleLogs = useCallback(() => setLogsExpanded(e => !e), []);
    const toggleFailures = useCallback(() => setFailuresExpanded(e => !e), []);

    if (!currentUser) return null;

    const isDashboardActive = pathname.includes("/dashboard");
    const isLogsActive = pathname.startsWith("/logs");
    const isFailuresActive = pathname.startsWith("/failures");
    const isHierarchyActive = pathname === "/hierarchy";

    return (
        <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "#f8fafc" }}>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay${mobileSidebarOpen ? " mobile-open" : ""}`}
                onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar toggle — fixed, never clipped */}
            <button
                onClick={toggleSidebar}
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                className="sidebar-toggle-btn"
                style={{ left: sidebarOpen ? "calc(240px - 12px)" : "calc(64px - 12px)" }}
            >
                {sidebarOpen
                    ? <ChevronLeft size={13} strokeWidth={2.5} />
                    : <ChevronRight size={13} strokeWidth={2.5} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`sidebar${sidebarOpen ? "" : " sidebar-collapsed"}${mobileSidebarOpen ? " mobile-open" : ""}`}
                style={{
                    width: sidebarOpen ? "240px" : "64px",
                    transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                    position: "fixed",
                    background: "#ffffff",
                    borderRight: "1px solid #e2e8f0",
                    padding: "0",
                }}
            >
                {/* Brand */}
                <div className="sb-brand" style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                    <div className="sb-brand-icon"><LayoutDashboard size={16} strokeWidth={2} /></div>
                    {sidebarOpen && <span className="sb-brand-text">Log Monitor</span>}
                </div>

                <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                    {/* Dashboard */}
                    <Link
                        href={dashboardLink?.href || "/"}
                        className={`sb-item ${isDashboardActive ? "sb-active" : ""}`}
                        title={!sidebarOpen ? "Dashboard" : undefined}
                        style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
                    >
                        <LayoutDashboard size={18} className="sb-icon" />
                        {sidebarOpen && <span className="sb-label">Dashboard</span>}
                    </Link>

                    {sidebarOpen && <div className="sb-section-label">Records</div>}

                    {/* Work Logs */}
                    <div>
                        <button
                            className={`sb-item ${isLogsActive ? "sb-active" : ""}`}
                            onClick={sidebarOpen ? toggleLogs : undefined}
                            title={!sidebarOpen ? "Work Logs" : undefined}
                            style={{ justifyContent: sidebarOpen ? "space-between" : "center", width: "100%" }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <ClipboardList size={18} className="sb-icon" />
                                {sidebarOpen && <span className="sb-label">Work Logs</span>}
                            </span>
                            {sidebarOpen && (
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {counts.totals.workLogs > 0 && (
                                        <span className="sb-badge sb-badge-blue">{counts.totals.workLogs}</span>
                                    )}
                                    <ChevronDown size={14} className="sb-chevron"
                                        style={{ transform: logsExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                                </span>
                            )}
                        </button>
                        {sidebarOpen && logsExpanded && (
                            <div className="sb-submenu">
                                {monthLinks.map(m => (
                                    <Link
                                        key={m.value}
                                        href={`/logs?month=${m.value}`}
                                        className={`sb-sub-item ${isLogsActive && currentMonth === m.value ? "sb-active" : ""}`}
                                    >
                                        <span style={{ flex: 1, fontSize: "13px" }}>{m.label}</span>
                                        {(counts.monthCounts.workLogs[m.value] || 0) > 0 && (
                                            <span className="sb-badge sb-badge-blue">{counts.monthCounts.workLogs[m.value]}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Failure Reports */}
                    <div>
                        <button
                            className={`sb-item ${isFailuresActive ? "sb-active" : ""}`}
                            onClick={sidebarOpen ? toggleFailures : undefined}
                            title={!sidebarOpen ? "Failure Reports" : undefined}
                            style={{ justifyContent: sidebarOpen ? "space-between" : "center", width: "100%" }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <AlertTriangle size={18} className="sb-icon" />
                                {sidebarOpen && <span className="sb-label">Failure Reports</span>}
                            </span>
                            {sidebarOpen && (
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {counts.totals.openFailures > 0 && (
                                        <span className="sb-badge sb-badge-red">{counts.totals.openFailures}</span>
                                    )}
                                    <ChevronDown size={14} className="sb-chevron"
                                        style={{ transform: failuresExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                                </span>
                            )}
                        </button>
                        {sidebarOpen && failuresExpanded && (
                            <div className="sb-submenu">
                                {monthLinks.map(m => (
                                    <Link
                                        key={m.value}
                                        href={`/failures?month=${m.value}`}
                                        className={`sb-sub-item ${isFailuresActive && currentMonth === m.value ? "sb-active" : ""}`}
                                    >
                                        <span style={{ flex: 1, fontSize: "13px" }}>{m.label}</span>
                                        {(counts.monthCounts.failures[m.value] || 0) > 0 && (
                                            <span className="sb-badge sb-badge-red">{counts.monthCounts.failures[m.value]}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Section */}
                    <Link
                        href="/hierarchy"
                        className={`sb-item ${isHierarchyActive ? "sb-active" : ""}`}
                        title={!sidebarOpen ? "My Section" : undefined}
                        style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
                    >
                        <Users size={18} className="sb-icon" />
                        {sidebarOpen && <span className="sb-label">My Section</span>}
                    </Link>
                </nav>

                {/* Footer */}
                <div className="sb-footer" style={{ borderTop: "1px solid #e2e8f0" }}>
                    <button
                        onClick={logout}
                        className="sb-item sb-logout"
                        title={!sidebarOpen ? "Logout" : undefined}
                        style={{ justifyContent: sidebarOpen ? "flex-start" : "center", width: "100%" }}
                    >
                        <LogOut size={18} className="sb-icon" />
                        {sidebarOpen && <span className="sb-label">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-wrapper" style={{ padding: 0 }}>
                {/* Header */}
                <header style={{
                    padding: "0 40px", height: "60px", borderBottom: "1px solid #e2e8f0",
                    background: "white", display: "flex", justifyContent: "space-between",
                    alignItems: "center", position: "sticky", top: 0, zIndex: 100, gap: "12px",
                }}>
                    <button className="mobile-hamburger" onClick={() => setMobileSidebarOpen(true)} aria-label="Open menu">
                        <Menu size={18} />
                    </button>
                    <h1
                        onClick={() => router.push(dashboardLink?.href || "/")}
                        style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: 0, cursor: "pointer", letterSpacing: "-0.01em" }}
                    >
                        {pathname.startsWith("/logs") ? "Work Logs" :
                            pathname.startsWith("/failures") ? "Failure Reports" :
                                pathname.includes("/dashboard") ? (dashboardLink?.label || "Dashboard") :
                                    pathname.includes("/hierarchy") ? "My Section / Team" : "Log Monitor"}
                        {currentMonth && monthLabel && (
                            <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: "10px", fontSize: "14px" }}>
                                — {monthLabel}
                            </span>
                        )}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="header-user-name" style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{currentUser.name}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{currentUser.sub}</div>
                        </div>
                        <div ref={dropdownRef} style={{ position: "relative" }}>
                            <button
                                onClick={() => setDropdownOpen(d => !d)}
                                style={{
                                    width: "34px", height: "34px", borderRadius: "50%",
                                    background: "#eef2ff", display: "flex", alignItems: "center",
                                    justifyContent: "center", color: "#4f46e5",
                                    fontWeight: 700, fontSize: "13px", cursor: "pointer", border: "none",
                                }}
                            >
                                {currentUser.name.charAt(0).toUpperCase()}
                            </button>
                            {dropdownOpen && (
                                <div style={{
                                    position: "absolute", top: "42px", right: 0, background: "white",
                                    borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                                    border: "1px solid #e2e8f0", minWidth: "160px",
                                    zIndex: 1000, overflow: "hidden", padding: "4px",
                                }}>
                                    <button onClick={() => { setDropdownOpen(false); router.push("/profile"); }} className="sb-dropdown-item">
                                        <User size={14} /> Profile
                                    </button>
                                    <button onClick={() => { setDropdownOpen(false); logout(); }} className="sb-dropdown-item sb-dropdown-danger">
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content — memo'd so it never re-renders on sidebar/dropdown toggles */}
                <StablePageContent>{children}</StablePageContent>

                <div style={{
                    position: "fixed", bottom: "5px", right: "5px",
                    background: "rgba(0,0,0,0.05)", padding: "2px 6px",
                    borderRadius: "4px", fontSize: "10px", color: "#64748b",
                    zIndex: 9999, pointerEvents: "none", fontFamily: "monospace",
                }}>
                    Version 1.2.0
                </div>
            </main>
        </div>
    );
}
