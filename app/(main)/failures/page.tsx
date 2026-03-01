"use client";

import React, { useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGlobal } from '@/app/context/GlobalContext';
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { Complaint } from '@/app/types';
import { PaginationControls } from '@/app/components/PaginationControls';
import ComplaintDetailModal from '@/app/components/ComplaintDetailModal';
import { ResolutionModal } from '@/app/components/ResolutionModal';

export default function FailuresPage() {
    return (
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading failures...</div>}>
            <FailuresPageContent />
        </Suspense>
    );
}

function FailuresPageContent() {
    const { currentUser, resolveComplaint } = useGlobal();
    const searchParams = useSearchParams();
    const month = searchParams.get('month');

    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);

    const pageSize = 15;
    const {
        data: complaints,
        loading,
        meta,
        setPage,
        page
    } = usePaginatedData<Complaint>(
        '/api/complaints',
        {
            userId: currentUser?.id || '',
            role: currentUser?.role || '',
            month: month || ''
        },
        pageSize,
        !!currentUser
    );

    if (!currentUser) return null;

    const canResolve = ['sse', 'je', 'technician'].includes(currentUser.role);

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        {month ? `Failure Reports for ${new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'All Failure Reports'}
                    </h2>
                    <div className="badge badge-open" style={{ textTransform: 'none', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        {complaints.filter(c => c.status === 'Open').length} Open Issues
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                            <div className="loading-spinner" style={{ marginBottom: '12px' }}>⌛</div>
                            Fetching failures...
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Status</th>
                                    <th>Raised By</th>
                                    <th>Description</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.length > 0 ? complaints.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>#{c.id.slice(-6)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {c.status === 'Open' && <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px' }}>NEW</span>}
                                                <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{c.authorName}</td>
                                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {(() => {
                                                const match = c.description?.match(/Details:\s*(.+)$/i);
                                                const details = match?.[1]?.trim();
                                                return details && details.toLowerCase() !== 'no details provided'
                                                    ? details
                                                    : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No details provided</span>;
                                            })()}
                                        </td>
                                        <td style={{ fontSize: '13px' }}>
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setViewingComplaint(c)}
                                                    className="btn btn-sm btn-outline"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                >
                                                    View
                                                </button>
                                                {canResolve && c.status === 'Open' && (
                                                    <button
                                                        onClick={() => setResolvingComplaint(c)}
                                                        className="btn btn-sm btn-primary"
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                            No failures found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {meta && meta.totalPages > 1 && (
                    <div style={{ marginTop: '24px' }}>
                        <PaginationControls
                            currentPage={page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={setPage}
                            loading={loading}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <ComplaintDetailModal
                complaint={viewingComplaint}
                onClose={() => setViewingComplaint(null)}
            />
            {resolvingComplaint && (
                <ResolutionModal
                    complaint={resolvingComplaint}
                    onClose={() => setResolvingComplaint(null)}
                    onResolve={async (data: any) => {
                        await resolveComplaint(resolvingComplaint.id, data);
                        setResolvingComplaint(null);
                    }}
                />
            )}
        </div>
    );
}
