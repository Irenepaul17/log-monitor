"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { WorkReport, Complaint } from "@/app/types";
import { usePaginatedData } from "@/app/hooks/usePaginatedData";
import { PaginationControls } from "@/app/components/PaginationControls";

export default function AdminDashboard() {
    const { currentUser } = useGlobal();
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "reports" | "failures" | "assets">("overview");
    const [stats, setStats] = useState({
        totalUsers: 0, totalReports: 0, totalFailures: 0, openFailures: 0,
        assetStats: { ei: 0, points: 0, signals: 0, trackCircuits: 0 }
    });
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const [reportSearch, setReportSearch] = useState("");
    const [debouncedReportSearch, setDebouncedReportSearch] = useState("");
    const [failureSearch, setFailureSearch] = useState("");
    const [debouncedFailureSearch, setDebouncedFailureSearch] = useState("");
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Paginated reports (all roles)
    const { data: reports, loading: reportsLoading, page: reportPage, setPage: setReportPage, meta: reportMeta, refresh: refreshReports } =
        usePaginatedData<WorkReport>("/api/work-reports", { userId: currentUser?.id || "", role: "admin", search: debouncedReportSearch }, 15, !!currentUser);

    // Paginated failures (all roles)
    const { data: failures, loading: failuresLoading, page: failurePage, setPage: setFailurePage, meta: failureMeta } =
        usePaginatedData<Complaint>("/api/complaints", { userId: currentUser?.id || "", role: "admin", search: debouncedFailureSearch }, 15, !!currentUser);

    useEffect(() => {
        if (!currentUser) return;
        // Fetch system-wide stats
        Promise.all([
            fetch(`/api/admin/stats`).then(r => r.ok ? r.json() : null),
            fetch("/api/user/team?role=admin").then(r => r.ok ? r.json() : []),
        ]).then(([s, u]) => {
            if (s) setStats(s);
            if (u) setAllUsers(u);
        }).catch(console.error);
    }, [currentUser]);

    // Fallback: fetch all users if team endpoint doesn't support role=admin
    useEffect(() => {
        if (!currentUser) return;
        fetch("/api/user/all").then(r => r.ok ? r.json() : null).then(d => {
            if (d && Array.isArray(d)) setAllUsers(d);
        }).catch(() => { });
    }, [currentUser]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        setDeletingUserId(userId);
        try {
            const res = await fetch(`/api/user/${userId}`, { method: "DELETE" });
            if (res.ok) {
                setAllUsers(prev => prev.filter(u => u.id !== userId));
                alert("User deleted successfully.");
            } else {
                const e = await res.json();
                alert(e.error || "Failed to delete user.");
            }
        } catch {
            alert("Failed to delete user.");
        } finally {
            setDeletingUserId(null);
        }
    };

    if (!currentUser || currentUser.role !== "admin") {
        return <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>Access Denied — Admin only.</div>;
    }

    const roleBadge = (role: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            admin: { bg: "#7c3aed", color: "white" },
            "sr-dste": { bg: "#1e40af", color: "white" },
            dste: { bg: "#1d4ed8", color: "white" },
            adste: { bg: "#0369a1", color: "white" },
            sse: { bg: "#047857", color: "white" },
            je: { bg: "#b45309", color: "white" },
            technician: { bg: "#6b7280", color: "white" },
        };
        const c = colors[role] || { bg: "#94a3b8", color: "white" };
        return (
            <span style={{ background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                {role}
            </span>
        );
    };

    const tabs = [
        { id: "overview", label: "📊 Overview" },
        { id: "users", label: "👥 All Users" },
        { id: "reports", label: "📋 Work Logs" },
        { id: "failures", label: "⚠️ Failures" },
        { id: "assets", label: "🏗️ Assets" },
    ] as const;

    return (
        <div className="screen active" style={{ display: "block" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h2 className="section-title" style={{ margin: 0 }}>🛡️ Admin Control Panel</h2>
                    <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>Full system access — System Admin</p>
                </div>
                <span style={{ background: "#7c3aed", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    ADMIN
                </span>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{
                            padding: "10px 18px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                            background: activeTab === t.id ? "var(--primary)" : "transparent",
                            color: activeTab === t.id ? "white" : "var(--muted)",
                            borderRadius: "6px 6px 0 0",
                            borderBottom: activeTab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
                        {[
                            { label: "Total Users", value: allUsers.length, color: "#7c3aed", icon: "👥" },
                            { label: "Total Work Logs", value: reportMeta?.total ?? "—", color: "#2563eb", icon: "📋" },
                            { label: "Total Failures", value: failureMeta?.total ?? "—", color: "#dc2626", icon: "⚠️" },
                            { label: "EI Assets", value: stats.assetStats?.ei ?? "—", color: "#0891b2", icon: "🖥️" },
                            { label: "Point Assets", value: stats.assetStats?.points ?? "—", color: "#059669", icon: "🔀" },
                            { label: "Signal Assets", value: stats.assetStats?.signals ?? "—", color: "#d97706", icon: "🚦" },
                        ].map(card => (
                            <div key={card.label} className="card" style={{ padding: 20, borderLeft: `4px solid ${card.color}` }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick links */}
                    <div className="card" style={{ padding: 24 }}>
                        <div className="section-title" style={{ fontSize: 15, marginBottom: 16 }}>Quick Access — Asset Directories</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                            {[
                                { label: "EI Assets", href: "/dashboard/assets/ei", icon: "🖥️" },
                                { label: "Point Assets", href: "/dashboard/assets/point", icon: "🔀" },
                                { label: "Signal Assets", href: "/dashboard/assets/signal", icon: "🚦" },
                                { label: "Track Circuit Assets", href: "/dashboard/assets/track-circuit", icon: "🛤️" },
                                { label: "User Management", href: "/user-creation", icon: "👤" },
                                { label: "Team Hierarchy", href: "/hierarchy", icon: "🗂️" },
                            ].map(link => (
                                <Link key={link.href} href={link.href} className="card"
                                    style={{
                                        padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
                                        textDecoration: "none", color: "inherit", fontSize: 14, fontWeight: 600,
                                        transition: "box-shadow 0.15s", cursor: "pointer"
                                    }}>
                                    <span style={{ fontSize: 22 }}>{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>All Users ({allUsers.length})</h3>
                        <Link href="/user-creation" className="btn btn-primary" style={{ fontSize: 13 }}>+ Create User</Link>
                    </div>
                    <div className="table-container" style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Sub-designation</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>PF Number</th>
                                    <th style={{ position: "sticky", right: 0, background: "white", minWidth: 120 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No users found.</td></tr>
                                ) : allUsers.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td>{roleBadge(u.role)}</td>
                                        <td>{u.sub}</td>
                                        <td style={{ fontFamily: "monospace" }}>{u.phone}</td>
                                        <td>{u.email}</td>
                                        <td>{u.pfNumber}</td>
                                        <td style={{ position: "sticky", right: 0, background: "white", whiteSpace: "nowrap" }}>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                                disabled={deletingUserId === u.id || u.role === "admin"}
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                            >
                                                {deletingUserId === u.id ? "..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* WORK LOGS TAB */}
            {activeTab === "reports" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: 16, flex: 1 }}>All Work Logs</h3>
                        <input type="text" className="input" placeholder="Search author, station…" value={reportSearch}
                            onChange={e => { setReportSearch(e.target.value); setTimeout(() => setDebouncedReportSearch(e.target.value), 400); }}
                            style={{ width: 240 }} />
                    </div>
                    <div className="table-container">
                        {reportsLoading ? <div style={{ padding: 40, textAlign: "center" }}>Loading…</div> : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th><th>Author</th><th>Role</th><th>Station</th><th>Shift</th><th>Category</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 500 }}>{String(r.date)}</td>
                                            <td>{r.authorName}</td>
                                            <td>{r.sseSection}</td>
                                            <td>{r.station}</td>
                                            <td>{r.shift}</td>
                                            <td><span className="badge badge-progress" style={{ fontSize: 10 }}>{r.classification?.toUpperCase().replace(/_/g, " ") || "N/A"}</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-primary" onClick={() => setViewingReport(r)} style={{ padding: "4px 10px", fontSize: 12 }}>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No logs found.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {reportMeta && reportMeta.totalPages > 1 && (
                        <div style={{ padding: "0 24px 24px" }}>
                            <PaginationControls currentPage={reportPage} totalPages={reportMeta.totalPages} totalItems={reportMeta.total} onPageChange={setReportPage} loading={reportsLoading} />
                        </div>
                    )}
                </div>
            )}

            {/* FAILURES TAB */}
            {activeTab === "failures" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: 16, flex: 1 }}>All Failure Reports</h3>
                        <input type="text" className="input" placeholder="Search…" value={failureSearch}
                            onChange={e => { setFailureSearch(e.target.value); setTimeout(() => setDebouncedFailureSearch(e.target.value), 400); }}
                            style={{ width: 240 }} />
                    </div>
                    <div className="table-container">
                        {failuresLoading ? <div style={{ padding: 40, textAlign: "center" }}>Loading…</div> : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th><th>Author</th><th>Category</th><th>Status</th><th>Details</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {failures.map(f => (
                                        <tr key={f.id}>
                                            <td style={{ fontWeight: 500 }}>{String(f.date)}</td>
                                            <td>{f.authorName}</td>
                                            <td>{f.category}</td>
                                            <td>
                                                <span className={`badge ${f.status === "Open" ? "badge-open" : "badge-resolved"}`} style={{ fontSize: 10 }}>
                                                    {f.status}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}
                                                title={f.details || ""}>
                                                {f.details || <span style={{ color: "var(--muted)", fontStyle: "italic" }}>No details</span>}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-primary" onClick={() => setViewingComplaint(f)} style={{ padding: "4px 10px", fontSize: 12 }}>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {failures.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No failures found.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {failureMeta && failureMeta.totalPages > 1 && (
                        <div style={{ padding: "0 24px 24px" }}>
                            <PaginationControls currentPage={failurePage} totalPages={failureMeta.totalPages} totalItems={failureMeta.total} onPageChange={setFailurePage} loading={failuresLoading} />
                        </div>
                    )}
                </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === "assets" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    {[
                        { label: "EI Assets", href: "/dashboard/assets/ei", description: "Electronic Interlocking assets — full edit access", icon: "🖥️", color: "#2563eb" },
                        { label: "Point Assets", href: "/dashboard/assets/point", description: "Point machines and relay data", icon: "🔀", color: "#059669" },
                        { label: "Signal Assets", href: "/dashboard/assets/signal", description: "Signal head and lamp data", icon: "🚦", color: "#d97706" },
                        { label: "Track Circuit Assets", href: "/dashboard/assets/track-circuit", description: "DCTC / AFTC track circuit details", icon: "🛤️", color: "#0891b2" },
                    ].map(a => (
                        <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
                            <div className="card" style={{ padding: 24, borderLeft: `4px solid ${a.color}`, cursor: "pointer", height: "100%" }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{a.label}</div>
                                <div style={{ fontSize: 13, color: "var(--muted)" }}>{a.description}</div>
                                <div style={{ marginTop: 16, color: a.color, fontSize: 13, fontWeight: 600 }}>Open Directory →</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modals */}
            <WorkReportDetailModal report={viewingReport} onClose={() => setViewingReport(null)} />
            <ComplaintDetailModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
        </div>
    );
}
