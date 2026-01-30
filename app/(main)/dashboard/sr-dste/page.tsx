"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useState } from "react";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { WorkReport, Complaint } from "@/app/context/GlobalContext";

export default function SrDSTEDashboard() {
    const { currentUser, reports, complaints } = useGlobal();
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

    if (!currentUser) return null;

    // Sr. DSTE sees absolutely everything
    const allReports = reports;
    const allComplaints = complaints;

    return (
        <div className="screen active" style={{ display: "block" }}>
            <div className="alert alert-danger">
                <strong>SR. DSTE ({currentUser.name}) MONITORING DASHBOARD:</strong> View-only access to monitor all system work reports and complaints. Complaint resolution is handled by SSE/JE.
            </div>

            <div className="card">
                <div className="section-title">All System Reports</div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Author</th><th>Work</th><th>Station</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {allReports.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.date}</td>
                                    <td>{r.authorName}</td>
                                    <td>{r.classification.toUpperCase()}</td>
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
                </div>
            </div>

            <div className="card">
                <div className="section-title">All Failure Reports (Complaints)</div>
                <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                    💡 Monitoring view only. Complaints are resolved by SSE/JE personnel.
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Status</th><th>Raised By</th><th>Issue</th><th>Resolved By</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {allComplaints.length > 0 ? allComplaints.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td><span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span></td>
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
                </div>
            </div>

            <WorkReportDetailModal report={viewingReport} onClose={() => setViewingReport(null)} />
            <ComplaintDetailModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
        </div>
    );
}
