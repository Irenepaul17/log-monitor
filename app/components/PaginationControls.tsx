import React from 'react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    loading?: boolean;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    loading,
    pageSize = 10,
    onPageSizeChange
}: Props) {
    if (totalItems === 0) return null;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '24px',
            marginTop: '20px',
            paddingTop: '15px',
            borderTop: '1px solid var(--border)'
        }}>
            {onPageSizeChange && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        disabled={loading}
                        style={{
                            padding: '4px 8px',
                            fontSize: '13px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {[10, 20, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            )}

            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} items)
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    style={{ padding: '6px 12px' }}
                >
                    Previous
                </button>
                <div style={{ display: "flex", gap: "4px", minWidth: '160px', justifyContent: 'center' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, i, arr) => (
                            <React.Fragment key={p}>
                                {i > 0 && arr[i - 1] !== p - 1 && <span style={{ padding: '4px', color: 'var(--muted)', minWidth: '20px', textAlign: 'center' }}>...</span>}
                                <button
                                    className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => onPageChange(p)}
                                    disabled={loading}
                                    style={{ width: '32px', minWidth: '32px', padding: '0', display: 'flex', justifyContent: 'center' }}
                                >
                                    {p}
                                </button>
                            </React.Fragment>
                        ))}
                </div>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    style={{ padding: '6px 12px' }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
