"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { WorkReport, Complaint } from "@/app/types";
import { usePaginatedData } from "@/app/hooks/usePaginatedData";
import { PaginationControls } from "@/app/components/PaginationControls";
import AssetSelectionModal from "@/app/components/AssetSelectionModal";
import { SOSAlertListener } from "@/app/components/SOSAlertListener";

export default function AdminDashboard() {
    const { currentUser } = useGlobal();
    const [stats, setStats] = useState({
        totalUsers: 0, totalReports: 0, totalFailures: 0, openFailures: 0,
        assetStats: { ei: 0, points: 0, signals: 0, trackCircuits: 0 }
    });

    // For the User Management Modal
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

    // Paginated reports (all roles)
    const { data: reports, loading: reportsLoading, page: reportPage, setPage: setReportPage, meta: reportMeta } =
        usePaginatedData<WorkReport>("/api/work-reports", { userId: currentUser?.id || "", role: "admin" }, 10, !!currentUser);

    // Paginated failures (all roles)
    const { data: failures, loading: failuresLoading, page: failurePage, setPage: setFailurePage, meta: failureMeta } =
        usePaginatedData<Complaint>("/api/complaints", { userId: currentUser?.id || "", role: "admin" }, 10, !!currentUser);

    useEffect(() => {
        if (!currentUser) return;
        Promise.all([
            fetch(`/api/admin/stats`).then(r => r.ok ? r.json() : null),
            fetch("/api/user/all").then(r => r.ok ? r.json() : [])
        ]).then(([s, u]) => {
            if (s) setStats(s);
            if (u && Array.isArray(u)) setAllUsers(u);
        }).catch(console.error);
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

    const renderAssetCard = (title: string, count: number, color: string, bgColor: string, borderColor: string) => (
        <div
            className="asset-card"
            style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '16px',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                cursor: 'pointer'
            }}
            onClick={() => setIsAssetModalOpen(true)}
        >
            <div style={{ fontSize: '42px', fontWeight: '900', color: color, lineHeight: 1, marginBottom: '2px', letterSpacing: '-1px' }}>
                {count}
            </div>
            <div style={{
                fontSize: '12px',
                color: 'var(--muted)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                {title}
            </div>
        </div>
    );

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

    return (
        <div className="screen active" style={{ display: "block" }}>
            <div className="alert alert-info">
                <strong>SYSTEM ADMIN DASHBOARD:</strong> Full system access to monitor all work reports, failures, assets, and manage users.
            </div>

            {/* System Management Panel */}
            <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>System Management</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <Link href="/user-creation" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center' }}>
                        Create User
                    </Link>
                    <Link href="/hierarchy" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center' }}>
                        Team Hierarchy
                    </Link>
                    <button onClick={() => setIsUsersModalOpen(true)} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center' }}>
                        Manage Users ({allUsers.length})
                    </button>
                </div>
            </div>

            {/* Asset Stats Dashboard */}
            <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>Asset Overview</h3>
                    <button
                        className="btn btn-outline"
                        onClick={() => setIsAssetModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}
                    >
                        <span>Asset Register</span>
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                    {renderAssetCard("EI Assets", stats.assetStats?.ei || 0, "#0284c7", "#f0f9ff", "#bae6fd")}
                    {renderAssetCard("Points", stats.assetStats?.points || 0, "#db2777", "#fdf2f8", "#fbcfe8")}
                    {renderAssetCard("Signals", stats.assetStats?.signals || 0, "#ca8a04", "#fefce8", "#fde047")}
                    {renderAssetCard("Track Circuits", stats.assetStats?.trackCircuits || 0, "#16a34a", "#f0fdf4", "#bbf7d0")}
                </div>
            </div>

            <SOSAlertListener />

            {/* Work Logs */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="section-title">
                    System Work Logs {reportMeta && `(${reportMeta.total})`}
                </div>
                <div className="table-container">
                    {reportsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading reports...</div>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr><th>Date</th><th>Author</th><th>Role</th><th>Station</th><th>Category</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {reports.map((r: WorkReport) => (
                                        <tr key={r.id}>
                                            <td>{String(r.date)}</td>
                                            <td>{r.authorName}</td>
                                            <td>{r.sseSection}</td>
                                            <td>{r.station}</td>
                                            <td>{r.classification ? r.classification.toUpperCase() : 'N/A'}</td>
                                            <td>
                                                <button
                                                    onClick={() => setViewingReport(r)}
                                                    className="btn btn-sm btn-primary"
                                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No logs found.</td></tr>}
                                </tbody>
                            </table>
                            <div className="mobile-card-table">
                                {reports.length > 0 ? reports.map((r: WorkReport) => (
                                    <div key={r.id} className="m-row">
                                        <div className="m-row-header">
                                            <span className="m-row-title">{r.authorName}</span>
                                            <span className="badge" style={{ background: '#eef2ff', color: '#4f46e5', fontSize: '11px' }}>{r.classification?.toUpperCase() || 'N/A'}</span>
                                        </div>
                                        <div className="m-row-meta">
                                            <span className="m-row-field"><span className="m-row-label">Date</span><span className="m-row-value">{String(r.date)}</span></span>
                                            <span className="m-row-field"><span className="m-row-label">Station</span><span className="m-row-value">{r.station}</span></span>
                                        </div>
                                        <div className="m-row-actions">
                                            <button onClick={() => setViewingReport(r)} className="btn btn-sm btn-primary">View</button>
                                        </div>
                                    </div>
                                )) : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No reports found.</div>}
                            </div>
                        </>
                    )}
                    {reportMeta && reportMeta.totalPages > 1 && (
                        <PaginationControls
                            currentPage={reportPage}
                            totalPages={reportMeta.totalPages}
                            totalItems={reportMeta.total}
                            onPageChange={setReportPage}
                            loading={reportsLoading}
                        />
                    )}
                </div>
            </div>

            {/* Failures */}
            <div className="card">
                <div className="section-title">
                    System Failure Reports {failureMeta && `(${failureMeta.total})`}
                </div>
                <div className="table-container">
                    {failuresLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading failure reports...</div>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr><th>ID</th><th>Status</th><th>Raised By</th><th>Category</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {failures.map((c: Complaint) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    {c.status === 'Open' && <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px' }}>NEW</span>}
                                                    <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                                </div>
                                            </td>
                                            <td>{c.authorName}</td>
                                            <td>{c.category}</td>
                                            <td>
                                                <button
                                                    onClick={() => setViewingComplaint(c)}
                                                    className="btn btn-sm btn-primary"
                                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {failures.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No failures found.</td></tr>}
                                </tbody>
                            </table>
                            <div className="mobile-card-table">
                                {failures.length > 0 ? failures.map((c: Complaint) => (
                                    <div key={c.id} className="m-row">
                                        <div className="m-row-header">
                                            <span className="m-row-title">{c.authorName}</span>
                                            <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                        </div>
                                        <div className="m-row-actions">
                                            <button onClick={() => setViewingComplaint(c)} className="btn btn-sm btn-primary">View</button>
                                        </div>
                                    </div>
                                )) : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No reports found.</div>}
                            </div>
                        </>
                    )}
                    {failureMeta && failureMeta.totalPages > 1 && (
                        <PaginationControls
                            currentPage={failurePage}
                            totalPages={failureMeta.totalPages}
                            totalItems={failureMeta.total}
                            onPageChange={setFailurePage}
                            loading={failuresLoading}
                        />
                    )}
                </div>
            </div>

            {/* User Management Modal */}
            {isUsersModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '90%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>User Management</h2>
                            <button onClick={() => setIsUsersModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--muted)' }}>&times;</button>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <table style={{ width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>No users found.</td></tr>
                                    ) : allUsers.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td>{roleBadge(u.role)}</td>
                                            <td style={{ fontFamily: "monospace" }}>{u.phone}</td>
                                            <td>{u.email}</td>
                                            <td style={{ textAlign: 'right' }}>
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
                </div>
            )}

            <WorkReportDetailModal report={viewingReport} onClose={() => setViewingReport(null)} />
            <ComplaintDetailModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
            <AssetSelectionModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} />
        </div>
    );
}
