"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useState } from "react";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { WorkReport, Complaint } from "@/app/types";
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';

export default function DSTEDashboard() {
    const { currentUser } = useGlobal(); // Removed reports/complaints from global
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

    // Fetch Paginated Reports
    const {
        data: allReports,
        loading: reportsLoading,
        page: reportsPage,
        setPage: setReportsPage,
        meta: reportsMeta
    } = usePaginatedData<WorkReport>(
        '/api/work-reports',
        { userId: currentUser?.id || '', role: currentUser?.role || '' },
        10,
        !!currentUser
    );

    // Fetch Paginated Complaints
    const {
        data: allComplaints,
        loading: complaintsLoading,
        page: complaintsPage,
        setPage: setComplaintsPage,
        meta: complaintsMeta
    } = usePaginatedData<Complaint>(
        '/api/complaints',
        { userId: currentUser?.id || '', role: currentUser?.role || '' },
        10,
        !!currentUser
    );

    if (!currentUser) return null;

    return (
        <div className="screen active" style={{ display: "block" }}>
            <div className="alert alert-danger">
                <strong>DSTE ({currentUser.name}) MONITORING DASHBOARD:</strong> View-only access to monitor all work reports and complaints. Complaint resolution is handled by SSE/JE.
            </div>

            <div className="card">
                <div className="section-title">All Team Reports</div>
                <div className="table-container">
                    {reportsLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading reports...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr><th>Date</th><th>Author</th><th>Work</th><th>Station</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {allReports.map((r: WorkReport) => (
                                    <tr key={r.id}>
                                        <td>{r.date}</td>
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
                                ))}
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
                <div className="section-title">All Failure Reports (Complaints)</div>
                <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                    💡 Monitoring view only. Complaints are resolved by SSE/JE personnel.
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
                                {allComplaints.length > 0 ? allComplaints.map((c: Complaint) => (
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
                                            <button
                                                onClick={() => setViewingComplaint(c)}
                                                className="btn btn-sm btn-primary"
                                                style={{ padding: '4px 12px', fontSize: '12px' }}
                                            >
                                                View
                                            </button>
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

            <WorkReportDetailModal report={viewingReport} onClose={() => setViewingReport(null)} />
            <ComplaintDetailModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
        </div>
    );
}
