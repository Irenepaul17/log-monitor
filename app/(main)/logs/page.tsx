"use client";

import React, { useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGlobal } from '@/app/context/GlobalContext';
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { WorkReport } from '@/app/types';
import { PaginationControls } from '@/app/components/PaginationControls';
import WorkReportDetailModal from '@/app/components/WorkReportDetailModal';

export default function LogsPage() {
    return (
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading logs...</div>}>
            <LogsPageContent />
        </Suspense>
    );
}

function LogsPageContent() {
    const { currentUser } = useGlobal();
    const searchParams = useSearchParams();
    const month = searchParams.get('month');
    const [viewingReport, setViewingReport] = useState<WorkReport | null>(null);

    const pageSize = 15;
    const {
        data: reports,
        loading,
        meta,
        setPage,
        page
    } = usePaginatedData<WorkReport>(
        '/api/work-reports',
        {
            userId: currentUser?.id || '',
            role: currentUser?.role || '',
            month: month || ''
        },
        pageSize,
        !!currentUser
    );

    if (!currentUser) return null;

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        {month ? `Work Logs for ${new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'All Work Logs'}
                    </h2>
                    <div className="badge badge-progress" style={{ textTransform: 'none' }}>
                        Showing {reports.length} records
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                            <div className="loading-spinner" style={{ marginBottom: '12px' }}>⌛</div>
                            Fetching reports...
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Station</th>
                                    <th>Shift</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length > 0 ? reports.map((r) => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 500 }}>{String(r.date)}</td>
                                        <td>{r.authorName}</td>
                                        <td>
                                            <span className="badge badge-progress" style={{ fontSize: '10px' }}>
                                                {r.classification ? r.classification.toUpperCase().replace(/_/g, ' ') : 'N/A'}
                                            </span>
                                        </td>
                                        <td>{r.station}</td>
                                        <td>{r.shift}</td>
                                        <td>
                                            <button
                                                onClick={() => setViewingReport(r)}
                                                className="btn btn-sm btn-primary"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                            No logs found for this period.
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

            <WorkReportDetailModal
                report={viewingReport}
                onClose={() => setViewingReport(null)}
            />
        </div>
    );
}
