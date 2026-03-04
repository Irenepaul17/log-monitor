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

/* ─── Types ─────────────────────────────────────────── */
type Counts = {
    totals: { workLogs: number; openFailures: number };
    monthCounts: { workLogs: Record<string, number>; failures: Record<string, number> };
};

type MonthLink = { value: string; label: string };

/* ─── Sidebar (isolated – its own state so toggles never re-render children) ─── */
const AppSidebar = memo(function AppSidebar({
    counts,
    monthLinks,
    dashboardHref,
}: {
    counts: Counts;
    monthLinks: MonthLink[];
    dashboardHref: string;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get("month");
    const { logout } = useGlobal();

    const [open, setOpen] = useState(true);
    const [logsExpanded, setLogsExpanded] = useState(false);
    const [failuresExpanded, setFailuresExpanded] = useState(false);

    // Auto-expand sections when on those routes
    useEffect(() => {
        if (pathname.startsWith("/logs")) setLogsExpanded(true);
        if (pathname.startsWith("/failures")) setFailuresExpanded(true);
    }, [pathname]);

    // Drive main-content margin via CSS variable – no React state touches <main>
    useEffect(() => {
        document.documentElement.style.setProperty("--sb-w", open ? "240px" : "64px");
    }, [open]);

    const isDashboardActive = pathname.includes("/dashboard");
    const isLogsActive = pathname.startsWith("/logs");
    const isFailuresActive = pathname.startsWith("/failures");
    const isHierarchyActive = pathname === "/hierarchy";

    const toggleOpen = useCallback(() => setOpen(o => !o), []);
    const toggleLogs = useCallback(() => setLogsExpanded(e => !e), []);
    const toggleFailures = useCallback(() => setFailuresExpanded(e => !e), []);

    return (
        <>
            {/* Toggle button – fixed, never clipped by overflow:hidden */}
            <button
                onClick={toggleOpen}
                title={open ? "Collapse sidebar" : "Expand sidebar"}
                className="sidebar-toggle-btn"
                style={{ left: open ? "calc(240px - 12px)" : "calc(64px - 12px)" }}
            >
                {open ? <ChevronLeft size={13} strokeWidth={2.5} /> : <ChevronRight size={13} strokeWidth={2.5} />}
            </button>

            <aside
                className={`sidebar${open ? "" : " sidebar-collapsed"}`}
                style={{
                    width: open ? "240px" : "64px",
                    transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                    position: "fixed",
                    background: "#ffffff",
                    borderRight: "1px solid #e2e8f0",
                    padding: "0",
                }}
            >
                {/* Brand */}
                <div className="sb-brand" style={{ justifyContent: open ? "flex-start" : "center" }}>
                    <div className="sb-brand-icon">
                        <LayoutDashboard size={16} strokeWidth={2} />
                    </div>
                    {open && <span className="sb-brand-text">Log Monitor</span>}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>

                    <Link
                        href={dashboardHref || "/"}
                        className={`sb-item ${isDashboardActive ? "sb-active" : ""}`}
                        title={!open ? "Dashboard" : undefined}
                        style={{ justifyContent: open ? "flex-start" : "center" }}
                    >
                        <LayoutDashboard size={18} className="sb-icon" />
                        {open && <span className="sb-label">Dashboard</span>}
                    </Link>

                    {open && <div className="sb-section-label">Records</div>}

                    {/* Work Logs */}
                    <div>
                        <button
                            className={`sb-item ${isLogsActive ? "sb-active" : ""}`}
                            onClick={open ? toggleLogs : undefined}
                            title={!open ? "Work Logs" : undefined}
                            style={{ justifyContent: open ? "space-between" : "center", width: "100%" }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <ClipboardList size={18} className="sb-icon" />
                                {open && <span className="sb-label">Work Logs</span>}
                            </span>
                            {open && (
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {counts.totals.workLogs > 0 && (
                                        <span className="sb-badge sb-badge-blue">{counts.totals.workLogs}</span>
                                    )}
                                    <ChevronDown
                                        size={14}
                                        className="sb-chevron"
                                        style={{ transform: logsExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </span>
                            )}
                        </button>

                        {open && logsExpanded && (
                            <div className="sb-submenu">
                                {monthLinks.map(m => {
                                    const count = counts.monthCounts.workLogs[m.value] || 0;
                                    return (
                                        <Link
                                            key={m.value}
                                            href={`/logs?month=${m.value}`}
                                            className={`sb-sub-item ${pathname === "/logs" && currentMonth === m.value ? "sb-active" : ""}`}
                                        >
                                            <span style={{ flex: 1, fontSize: "13px" }}>{m.label}</span>
                                            {count > 0 && <span className="sb-badge sb-badge-blue">{count}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Failure Reports */}
                    <div>
                        <button
                            className={`sb-item ${isFailuresActive ? "sb-active" : ""}`}
                            onClick={open ? toggleFailures : undefined}
                            title={!open ? "Failure Reports" : undefined}
                            style={{ justifyContent: open ? "space-between" : "center", width: "100%" }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <AlertTriangle size={18} className="sb-icon" />
                                {open && <span className="sb-label">Failure Reports</span>}
                            </span>
                            {open && (
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {counts.totals.openFailures > 0 && (
                                        <span className="sb-badge sb-badge-red">{counts.totals.openFailures}</span>
                                    )}
                                    <ChevronDown
                                        size={14}
                                        className="sb-chevron"
                                        style={{ transform: failuresExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </span>
                            )}
                        </button>

                        {open && failuresExpanded && (
                            <div className="sb-submenu">
                                {monthLinks.map(m => {
                                    const count = counts.monthCounts.failures[m.value] || 0;
                                    return (
                                        <Link
                                            key={m.value}
                                            href={`/failures?month=${m.value}`}
                                            className={`sb-sub-item ${pathname === "/failures" && currentMonth === m.value ? "sb-active" : ""}`}
                                        >
                                            <span style={{ flex: 1, fontSize: "13px" }}>{m.label}</span>
                                            {count > 0 && <span className="sb-badge sb-badge-red">{count}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* My Section */}
                    <Link
                        href="/hierarchy"
                        className={`sb-item ${isHierarchyActive ? "sb-active" : ""}`}
                        title={!open ? "My Section" : undefined}
                        style={{ justifyContent: open ? "flex-start" : "center" }}
                    >
                        <Users size={18} className="sb-icon" />
                        {open && <span className="sb-label">My Section</span>}
                    </Link>
                </nav>

                {/* Footer */}
                <div className="sb-footer" style={{ borderTop: "1px solid #e2e8f0" }}>
                    <button
                        onClick={logout}
                        className="sb-item sb-logout"
                        title={!open ? "Logout" : undefined}
                        style={{ justifyContent: open ? "flex-start" : "center", width: "100%" }}
                    >
                        <LogOut size={18} className="sb-icon" />
                        {open && <span className="sb-label">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
});

/* ─── Page Header (memoised to skip re-renders on unrelated state) ─── */
const AppHeader = memo(function AppHeader({
    currentUser,
    dashboardHref,
    monthLinks,
}: {
    currentUser: { name: string; sub: string; role: string };
    dashboardHref: string;
    monthLinks: MonthLink[];
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get("month");
    const router = useRouter();
    const { logout } = useGlobal();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pageTitle = useMemo(() => {
        if (pathname.startsWith("/logs")) return "Work Logs";
        if (pathname.startsWith("/failures")) return "Failure Reports";
        if (pathname.includes("/dashboard")) {
            const map: Record<string, string> = {
                "sr-dste": "Sr. DSTE Dashboard",
                dste: "DSTE Dashboard",
                adste: "ADSTE Dashboard",
                sse: "SSE Dashboard",
                je: "JE Dashboard",
                technician: "Dashboard",
            };
            return map[currentUser.role] || "Dashboard";
        }
        if (pathname.includes("/hierarchy")) return "My Section / Team";
        return "Log Monitor";
    }, [pathname, currentUser.role]);

    const monthLabel = useMemo(
        () => monthLinks.find(m => m.value === currentMonth)?.label,
        [monthLinks, currentMonth]
    );

    return (
        <header style={{
            padding: "0 40px",
            height: "60px",
            borderBottom: "1px solid #e2e8f0",
            background: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
            gap: "12px",
        }}>
            <button
                className="mobile-hamburger"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={18} />
            </button>

            <h1
                onClick={() => router.push(dashboardHref || "/")}
                style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: 0, cursor: "pointer", letterSpacing: "-0.01em" }}
            >
                {pageTitle}
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
                            justifyContent: "center", color: "#4f46e5", fontWeight: 700,
                            fontSize: "13px", cursor: "pointer", border: "none",
                        }}
                    >
                        {currentUser.name.charAt(0).toUpperCase()}
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: "absolute", top: "42px", right: 0,
                            background: "white", borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
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
    );
});

/* ─── Root Layout ─────────────────────────────────────── */
export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>}>
            <MainLayoutContent>{children}</MainLayoutContent>
        </Suspense>
    );
}

/* ─── Main Content – only fetches counts; sidebar state lives in AppSidebar ─── */
function MainLayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
    const { currentUser } = useGlobal();
    const [counts, setCounts] = useState<Counts>({
        totals: { workLogs: 0, openFailures: 0 },
        monthCounts: { workLogs: {}, failures: {} },
    });

    useEffect(() => {
        if (!currentUser) return;
        const fetch_ = async () => {
            try {
                const res = await fetch(`/api/dashboard/summary?userId=${currentUser.id}&role=${currentUser.role}`);
                if (res.ok) setCounts(await res.json());
            } catch { /* silent */ }
        };
        // Set the initial CSS var immediately so there's no flash
        document.documentElement.style.setProperty("--sb-w", "240px");
        fetch_();
        const iv = setInterval(fetch_, 60000);
        return () => clearInterval(iv);
    }, [currentUser]);

    const monthLinks = useMemo<MonthLink[]>(() => {
        const out: MonthLink[] = [];
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

    const dashboardHref = useMemo(() => {
        if (!currentUser) return "/";
        const map: Record<string, string> = {
            "sr-dste": "/dashboard/sr-dste",
            dste: "/dashboard/dste",
            adste: "/dashboard/adste",
            sse: "/dashboard/sse",
            je: "/dashboard/je",
            technician: "/dashboard/je",
        };
        return map[currentUser.role] || "/";
    }, [currentUser]);

    if (!currentUser) return null;

    return (
        <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "#f8fafc" }}>
            {/* Sidebar — fully isolated, toggles never touch <main> */}
            <AppSidebar counts={counts} monthLinks={monthLinks} dashboardHref={dashboardHref} />

            {/* Main — margin driven by CSS var, no React re-render on sidebar toggle */}
            <main className="main-wrapper" style={{ padding: 0 }}>
                <AppHeader currentUser={currentUser} dashboardHref={dashboardHref} monthLinks={monthLinks} />

                <div style={{ padding: "40px", minHeight: "calc(100vh - 60px)" }}>
                    {children}
                </div>

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
