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

export default function JEDashboard() {
    const { currentUser, resolveComplaint } = useGlobal(); // Removed reports/complaints from global
    const router = useRouter();
    const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

    // Fetch Paginated Reports (JE only sees own reports)
    const {
        data: myReports,
        loading: reportsLoading,
        page: reportsPage,
        setPage: setReportsPage,
        meta: reportsMeta
    } = usePaginatedData<WorkReport>(
        '/api/work-reports',
        { userId: currentUser?.id || '', role: 'je' },
        10,
        !!currentUser
    );

    // Fetch Paginated Complaints (JE sees own + supervisor assigned)
    const {
        data: myComplaints,
        loading: complaintsLoading,
        page: complaintsPage,
        setPage: setComplaintsPage,
        meta: complaintsMeta,
        refresh: refreshComplaints
    } = usePaginatedData<Complaint>(
        '/api/complaints',
        { userId: currentUser?.id || '', role: 'je' },
        10,
        !!currentUser
    );

    if (!currentUser) return null;

    return (
        <div className="screen active" style={{ display: "block" }}>
            <div className="card">
                <div
                    className="section-title"
                    style={{ justifyContent: "space-between" }}
                >
                    My Work Reports
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
                                        <td>{r.date}</td>
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
                            loading={reportsLoading}
                        />
                    )}
                </div>
            </div>

            <div className="card">
                <div className="section-title">
                    My Failure Reports (Complaints)
                </div>
                <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                    💡 Complaints are automatically generated when you report ANY failure (except "No Failures" status).
                </div>
                <div className="table-container">
                    {complaintsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading complaints...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Status</th><th>Raised By</th><th>Issue</th><th>Resolved By</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {myComplaints.length > 0 ? myComplaints.map((c: Complaint) => (
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
                                            {c.status === 'Closed' ? (
                                                <span style={{ fontSize: '13px', color: '#065f46' }}>
                                                    {c.resolvedBy} ({c.resolvedDate})
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Pending</span>
                                            )}
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
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>No failure reports yet.</td></tr>
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
        </div>
    );
}
