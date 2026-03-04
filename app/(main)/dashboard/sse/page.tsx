"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ResolutionModal } from "@/app/components/ResolutionModal";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { Complaint, WorkReport, AssetUpdateRequest } from "@/app/types";
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';
import { SOSButton } from "@/app/components/SOSButton";

import AssetSelectionModal from "@/app/components/AssetSelectionModal";
import AssetRequestDetailModal from "@/app/components/AssetRequestDetailModal";

export default function SSEDashboard() {
    const { currentUser, resolveComplaint } = useGlobal(); // Removed reports/complaints from global
    const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [assetRequests, setAssetRequests] = useState<AssetUpdateRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [viewingRequest, setViewingRequest] = useState<AssetUpdateRequest | null>(null);
    const [assetStats, setAssetStats] = useState({
        ei: 0, points: 0, signals: 0, trackCircuits: 0,
        recent: { ei: 0, points: 0, signals: 0, trackCircuits: 0 }
    });

    const fetchAssetRequests = () => {
        if (!currentUser?.id) return;
        setRequestsLoading(true);
        fetch(`/api/assets/request?sseId=${currentUser.id}&status=pending`)
            .then(res => res.json())
            .then(data => setAssetRequests(data))
            .catch(err => console.error("Failed to load asset requests", err))
            .finally(() => setRequestsLoading(false));
    };

    useEffect(() => {
        if (currentUser) {
            fetch('/api/assets/stats')
                .then(res => res.json())
                .then(data => setAssetStats(data))
                .catch(err => console.error("Failed to load asset stats", err));

            fetchAssetRequests();
        }
    }, [currentUser]);

    const handleAssetAction = async (requestId: string, action: 'approve' | 'reject') => {
        let comments = '';
        if (action === 'reject') {
            comments = prompt('Enter reason for rejection:') || 'Rejected';
        }

        try {
            const response = await fetch(`/api/assets/request/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    comments,
                    reviewerId: currentUser?.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process request');
            }

            alert(`Request ${action}d successfully.`);
            fetchAssetRequests();
            if (action === 'approve') {
                fetch('/api/assets/stats').then(res => res.json()).then(setAssetStats);
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    // Fetch Paginated Reports
    const {
        data: teamReports,
        loading: reportsLoading,
        page: reportsPage,
        setPage: setReportsPage,
        limit: reportsLimit,
        setLimit: setReportsLimit,
        meta: reportsMeta
    } = usePaginatedData<WorkReport>(
        '/api/work-reports',
        { userId: currentUser?.id || '', role: 'sse' },
        10,
        !!currentUser
    );

    // Fetch Paginated Complaints
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
        { userId: currentUser?.id || '', role: 'sse' },
        10,
        !!currentUser
    );

    // ... handle logout or other effects if any

    if (!currentUser) return null;

    const renderAssetCard = (title: string, count: number, recentCount: number, color: string, bgColor: string, borderColor: string, shortName: string, href: string) => (
        <Link href={href} style={{ textDecoration: 'none' }}>
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
            >
                <style jsx>{`
                .asset-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
            `}</style>

                {recentCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: color,
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '800',
                        boxShadow: '0 2px 8px -2px ' + color,
                        animation: 'pulse 2s infinite',
                        zIndex: 2
                    }}>
                        +{recentCount} NEW
                    </div>
                )}

                <div style={{ fontSize: '42px', fontWeight: '900', color: color, lineHeight: 1, marginBottom: '2px', letterSpacing: '-1px' }}>
                    {count}
                </div>

                {recentCount > 0 && (
                    <div style={{
                        fontSize: '10px',
                        color: color,
                        fontWeight: '700',
                        opacity: 0.8,
                        marginBottom: '8px',
                        textAlign: 'center'
                    }}>
                        recently added {recentCount} assets in {shortName}
                    </div>
                )}

                <div style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: recentCount > 0 ? '0' : '10px'
                }}>
                    {title}
                </div>

                {/* Subtle background decoration */}
                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: color,
                    opacity: 0.03,
                    zIndex: 0
                }} />
            </div>
        </Link>
    );

    return (
        <div className="screen active" style={{ display: "block" }}>
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
            <div className="alert alert-info">
                <strong>SSE ({currentUser.name}) DASHBOARD:</strong> Authority over JE & Technicians in your section.
            </div>

            {/* Asset Stats Dashboard */}
            <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>Asset Overview</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsAssetModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}
                    >
                        <span>+</span> Manage Assets
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                    {renderAssetCard("EI Assets", assetStats.ei, assetStats.recent.ei, "#0284c7", "#f0f9ff", "#bae6fd", "EI", "/dashboard/assets/ei")}
                    {renderAssetCard("Points", assetStats.points, assetStats.recent.points, "#db2777", "#fdf2f8", "#fbcfe8", "Points", "/dashboard/assets/point")}
                    {renderAssetCard("Signals", assetStats.signals, assetStats.recent.signals, "#ca8a04", "#fefce8", "#fde047", "Signals", "/dashboard/assets/signal")}
                    {renderAssetCard("Track Circuits", assetStats.trackCircuits, assetStats.recent.trackCircuits, "#16a34a", "#f0fdf4", "#bbf7d0", "Track Circuits", "/dashboard/assets/track-circuit")}
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <SOSButton />
                <a href="/work-report" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    + Submit Your Work Log
                </a>
            </div>

            {assetRequests.length > 0 && (
                <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 className="section-title" style={{ margin: 0, color: 'var(--primary)' }}>Pending Asset Approvals</h3>
                        <span className="badge badge-error">{assetRequests.length} REQUESTS</span>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Asset Details</th>
                                    <th>Requested By</th>
                                    <th>Date</th>
                                    <th>Change Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assetRequests.map((req, index) => (
                                    <tr key={req.id || `req-${index}`}>
                                        <td style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>
                                            <span className="badge" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                                {req.assetType}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>
                                                {req.proposedData.signalNoShuntNo || req.proposedData.pointNo || req.proposedData.station || req.proposedData.trackCircuitNo || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                                {req.proposedData.stationAutoSectionLcIbs || req.proposedData.station || 'N/A'}
                                            </div>
                                        </td>
                                        <td>{req.requestedByName}</td>
                                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                                {req.assetId ? 'Modification' : 'New Registration'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-sm" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }} onClick={() => setViewingRequest(req)}>View</button>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleAssetAction(req.id, 'approve')}>Approve</button>
                                                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleAssetAction(req.id, 'reject')}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="section-title">
                    Technicians Log Book {reportsMeta && `(${reportsMeta.total})`}
                </div>
                <div className="table-container">
                    {reportsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading reports...</div>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Author</th>
                                        <th>Category</th>
                                        <th>Station</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamReports.length > 0 ? teamReports.map((r: WorkReport, index) => (
                                        <tr key={r.id || `report-${index}`}>
                                            <td>{String(r.date)}</td>
                                            <td>{r.authorName}</td>
                                            <td>{r.classification ? r.classification.toUpperCase() : 'N/A'}</td>
                                            <td>{r.station}</td>
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
                                    )) : (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>No reports found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="mobile-card-table">
                                {teamReports.length > 0 ? teamReports.map((r: WorkReport, index) => (
                                    <div key={r.id || `report-m-${index}`} className="m-row">
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
                        </>)}
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
                    Failure Reports {complaintsMeta && `(${complaintsMeta.total})`}
                </div>
                <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                    Failures are automatically generated from failure reports. You can resolve failures reported by your team.
                </div>
                <div className="table-container">
                    {complaintsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading failure reports...</div>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr><th>ID</th><th>Status</th><th>Raised By</th><th>Issue</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {teamComplaints.length > 0 ? teamComplaints.map((c: Complaint, index) => (
                                        <tr key={c.id || `complaint-${index}`}>
                                            <td>{c.id}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    {c.status === 'Open' && <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px' }}>NEW</span>}
                                                    <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                                </div>
                                            </td>
                                            <td>{c.authorName}</td>
                                            <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {(() => {
                                                    const match = c.description?.match(/Details:\s*(.+)$/i);
                                                    const details = match?.[1]?.trim();
                                                    return details || '';
                                                })()}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => setViewingComplaint(c)}
                                                        className="btn btn-sm btn-primary"
                                                        style={{ padding: '4px 12px', fontSize: '12px' }}
                                                    >
                                                        View
                                                    </button>
                                                    {c.status === 'Open' && <button className="btn btn-primary btn-sm" onClick={() => setResolvingComplaint(c)}>Resolve</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>No complaints found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="mobile-card-table">
                                {teamComplaints.length > 0 ? teamComplaints.map((c: Complaint, index) => {
                                    const details = (() => { const m = c.description?.match(/Details:\s*(.+)$/i); return m?.[1]?.trim() || ''; })();
                                    return (
                                        <div key={c.id || `complaint-m-${index}`} className="m-row">
                                            <div className="m-row-header">
                                                <span className="m-row-title">{c.authorName}</span>
                                                <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                            </div>
                                            {details && <div className="m-row-value" style={{ fontSize: '13px', color: '#334155', maxWidth: '100%' }}>{details}</div>}
                                            <div className="m-row-actions">
                                                <button onClick={() => setViewingComplaint(c)} className="btn btn-sm btn-primary">View</button>
                                                {c.status === 'Open' && <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }} onClick={() => setResolvingComplaint(c)}>Resolve</button>}
                                            </div>
                                        </div>
                                    );
                                }) : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No complaints found.</div>}
                            </div>
                        </>)}
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
                    }}
                />
            )}
            <WorkReportDetailModal report={viewingReport} onClose={() => setViewingReport(null)} />
            <ComplaintDetailModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
            <AssetSelectionModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} />
            <AssetRequestDetailModal
                request={viewingRequest}
                onClose={() => setViewingRequest(null)}
                onApprove={(id) => handleAssetAction(id, 'approve')}
                onReject={(id) => handleAssetAction(id, 'reject')}
            />
        </div>
    );
}
