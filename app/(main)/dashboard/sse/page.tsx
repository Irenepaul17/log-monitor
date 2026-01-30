"use client";

import { useGlobal } from "@/app/context/GlobalContext";
import { useState } from "react";
import { ResolutionModal } from "@/app/components/ResolutionModal";
import WorkReportDetailModal from "@/app/components/WorkReportDetailModal";
import ComplaintDetailModal from "@/app/components/ComplaintDetailModal";
import { Complaint, WorkReport } from "@/app/context/GlobalContext";

export default function SSEDashboard() {
    const { currentUser, reports, complaints, resolveComplaint } = useGlobal();
    const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

    if (!currentUser) return null;

    // API already filters based on role - no need for client-side filtering
    const myReports = reports;
    const myComplaints = complaints;

    return (
        <div className="screen active" style={{ display: "block" }}>
            <div className="alert alert-info">
                <strong>SSE ({currentUser.name}) DASHBOARD:</strong> Authority over JE & Technicians in your section.
            </div>

            <div style={{ marginBottom: '20px' }}>
                <a href="/work-report" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                    + Submit Your Work Log
                </a>
            </div>

            <div className="card">
                <div className="section-title">Subordinate Work Reports</div>
                <div className="table-container">
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
                            {myReports.length > 0 ? myReports.map((r) => (
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
                            )) : (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>No team failure reports yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="section-title">Team Failure Reports (Complaints)</div>
                <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                    💡 Complaints are automatically generated from failure reports. You can resolve complaints reported by your team.
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Status</th><th>Raised By</th><th>Issue</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {myComplaints.map(c => (
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
                                            {c.status === 'Open' && <button className="btn btn-primary btn-sm" onClick={() => setResolvingComplaint(c)}>Resolve</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        </div>
    );
}
