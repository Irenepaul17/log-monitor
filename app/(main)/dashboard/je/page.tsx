"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResolutionModal } from "@/app/components/ResolutionModal";
import { Complaint, WorkReport } from "@/app/types";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';
import { SOSButton } from "@/app/components/SOSButton";
import { useEffect } from "react";
import AssetSelectionModal from "@/app/components/AssetSelectionModal";

export default function JEDashboard() {
    const { currentUser, resolveComplaint } = useGlobal(); // Removed reports/complaints from global
    const router = useRouter();
    const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [assetStats, setAssetStats] = useState({
        ei: 0, points: 0, signals: 0, trackCircuits: 0,
        recent: { ei: 0, points: 0, signals: 0, trackCircuits: 0 }
    });

    useEffect(() => {
        fetch('/api/assets/stats')
            .then(res => res.json())
            .then(data => setAssetStats(data))
            .catch(err => console.error("Failed to load asset stats", err));
    }, []);

    // Fetch Paginated Reports (JE only sees own reports)
    const {
        data: myReports,
        loading: reportsLoading,
        page: reportsPage,
        setPage: setReportsPage,
        limit: reportsLimit,
        setLimit: setReportsLimit,
        meta: reportsMeta
    } = usePaginatedData<WorkReport>(
        '/api/work-reports',
        { userId: currentUser?.id || '', role: 'je' },
        10,
        !!currentUser
    );

    // Fetch Paginated Complaints (JE sees own + supervisor assigned)
    const {
        data: teamComplaints,
        loading: complaintsLoading,
        page: complaintsPage,
        setPage: setComplaintsPage,
        limit: complaintsLimit,
        setLimit: setComplaintsLimit,
        meta: complaintsMeta,
        refresh: refreshComplaints
    } = usePaginatedData<Complaint>(
        '/api/complaints',
        { userId: currentUser?.id || '', role: 'je' },
        10,
        !!currentUser
    );

    if (!currentUser) return null;

    const renderAssetCard = (title: string, count: number, recentCount: number, color: string, bgColor: string, borderColor: string, shortName: string) => (
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
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
            }}
            onClick={() => setIsAssetModalOpen(true)}
        >
            <style jsx>{`
                .asset-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
            `}</style>
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

    return (
        <div className="screen active" style={{ display: "block" }}>
            {/* Asset Stats Dashboard */}
            <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>Asset Overview</h3>
                    <button
                        className="btn btn-outline"
                        onClick={() => setIsAssetModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}
                    >
                        <span>📡</span> Manage Assets
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                    {renderAssetCard("EI Assets", assetStats.ei, assetStats.recent.ei, "#0284c7", "#f0f9ff", "#bae6fd", "EI")}
                    {renderAssetCard("Points", assetStats.points, assetStats.recent.points, "#db2777", "#fdf2f8", "#fbcfe8", "Points")}
                    {renderAssetCard("Signals", assetStats.signals, assetStats.recent.signals, "#ca8a04", "#fefce8", "#fde047", "Signals")}
                    {renderAssetCard("Track Circuits", assetStats.trackCircuits, assetStats.recent.trackCircuits, "#16a34a", "#f0fdf4", "#bbf7d0", "Track Circuits")}
                </div>
            </div>

            <div className="card">
                <div
                    className="section-title"
                    style={{ padding: '0 0 15px 0', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}
                >
                    My Recent Work Logs {reportsMeta && `(${reportsMeta.total})`}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <SOSButton />
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => router.push('/work-report')}
                    >
                        + START LOG BOOK
                    </button>
                </div>
                <div className="table-container">
                    {reportsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading reports...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Technician</th>
                                    <th>Photos</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myReports.length > 0 ? myReports.map((r: WorkReport) => (
                                    <tr key={r.id}>
                                        <td>{String(r.date)}</td>
                                        <td>{r.classification ? r.classification.toUpperCase() : 'N/A'}</td>
                                        <td>{currentUser?.name}</td>
                                        <td>
                                            <span className="badge" style={{
                                                backgroundColor: r.attachments && r.attachments.length > 0 ? '#10b981' : '#e5e7eb',
                                                color: r.attachments && r.attachments.length > 0 ? 'white' : '#6b7280'
                                            }}>
                                                {r.attachments ? r.attachments.length : 0} {r.attachments && r.attachments.length === 1 ? 'FILE' : 'FILES'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setViewingReport(r)}
                                                className="btn btn-sm btn-outline"
                                                style={{ fontSize: '13px', padding: '6px 12px' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>No reports found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    {reportsMeta && (
                        <PaginationControls
                            currentPage={reportsPage}
                            totalPages={reportsMeta.totalPages}
                            totalItems={reportsMeta.total}
                            onPageChange={setReportsPage}
                            pageSize={reportsLimit}
                            onPageSizeChange={setReportsLimit}
                            loading={reportsLoading}
                        />
                    )}
                </div>
            </div>

            <div className="card">
                <div className="section-title">
                    Team Failure Reports {complaintsMeta && `(${complaintsMeta.total})`}
                </div>
                <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                    💡 Failures are automatically generated when you report ANY failure (except "No Failures" status).
                </div>
                <div className="table-container">
                    {complaintsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading failure reports...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Status</th><th>Raised By</th><th>Issue</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {teamComplaints.length > 0 ? teamComplaints.map((c: Complaint) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {c.status === 'Open' && <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px' }}>NEW</span>}
                                                <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                            </div>
                                        </td>
                                        <td>{c.authorName}</td>
                                        <td>{c.description}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setViewingComplaint(c)}
                                                    className="btn btn-sm btn-primary"
                                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                                >
                                                    View
                                                </button>
                                                {c.status === 'Open' && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setResolvingComplaint(c)}
                                                        style={{ padding: '4px 12px', fontSize: '12px' }}
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>No failures reported yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    {complaintsMeta && (
                        <PaginationControls
                            currentPage={complaintsPage}
                            totalPages={complaintsMeta.totalPages}
                            totalItems={complaintsMeta.total}
                            onPageChange={setComplaintsPage}
                            pageSize={complaintsLimit}
                            onPageSizeChange={setComplaintsLimit}
                            loading={complaintsLoading}
                        />
                    )}
                </div>
            </div>

            {/* Resolution Modal */}
            {resolvingComplaint && (
                <ResolutionModal
                    complaint={resolvingComplaint}
                    onClose={() => setResolvingComplaint(null)}
                    onResolve={async (data) => {
                        await resolveComplaint(resolvingComplaint.id, data);
                        setResolvingComplaint(null);
                        refreshComplaints(); // Refresh list after resolution
                    }}
                />
            )}

            {/* View Modals */}
            <WorkReportDetailModal report={viewingReport} onClose={() => setViewingReport(null)} />
            <ComplaintDetailModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
            <AssetSelectionModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} />
        </div>
    );
}
