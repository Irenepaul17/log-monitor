"use client";

import React, { useState, useEffect } from "react";
import { usePaginatedData } from "@/app/hooks/usePaginatedData";
import { TrackCircuitAsset } from "@/app/types/assets";
import { PaginationControls } from "@/app/components/PaginationControls";

export default function TrackCircuitAssetsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const {
        data: assets,
        loading,
        page,
        setPage,
        meta,
        refresh
    } = usePaginatedData<TrackCircuitAsset>(
        '/api/assets/track-circuit',
        { search: debouncedSearch },
        10,
        true
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Basic debounce
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const columns: { key: keyof TrackCircuitAsset | 'actions', label: string, minWidth: string }[] = [
        { key: 'sseSection', label: 'SSE Section', minWidth: '120px' },
        { key: 'station', label: 'Station', minWidth: '120px' },
        { key: 'trackCircuitNo', label: 'Track Circuit No', minWidth: '150px' },
        { key: 'type', label: 'Type (DC/AFTC)', minWidth: '120px' },
        { key: 'make', label: 'Make', minWidth: '120px' },
        { key: 'length', label: 'Length', minWidth: '100px' },
        { key: 'dateOfInstallation', label: 'Installation Date', minWidth: '150px' },
        { key: 'finacialYear', label: 'FY', minWidth: '100px' },
        { key: 'relayType', label: 'Relay Type', minWidth: '120px' },
        { key: 'relayMake', label: 'Relay Make', minWidth: '120px' },
        { key: 'batteryType', label: 'Battery Type', minWidth: '150px' },
        { key: 'batteryQty', label: 'Battery Qty', minWidth: '100px' },
        { key: 'chargerType', label: 'Charger Type', minWidth: '150px' },
        { key: 'location', label: 'Location', minWidth: '120px' },
        { key: 'status', label: 'Status', minWidth: '100px' },
        { key: 'actions', label: 'Actions', minWidth: '100px' }
    ];

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => window.history.back()} className="btn btn-outline" style={{ padding: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="section-title" style={{ margin: 0 }}>Track Circuit Assets</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search Track Circuits..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="input"
                            style={{ width: '250px' }}
                        />
                        <button className="btn btn-primary" onClick={() => alert('Add feature coming soon!')}>
                            + Add Track Circuit
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', position: 'relative' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={col.key} style={{
                                        position: idx === 0 ? 'sticky' : (col.key === 'actions' ? 'sticky' : 'static'),
                                        left: idx === 0 ? 0 : 'auto',
                                        right: col.key === 'actions' ? 0 : 'auto',
                                        zIndex: (idx === 0 || col.key === 'actions') ? 20 : 1,
                                        backgroundColor: (idx === 0 || col.key === 'actions') ? 'white' : 'var(--card-bg)',
                                        minWidth: col.minWidth,
                                        fontSize: '12px',
                                        wordBreak: 'break-word',
                                        whiteSpace: col.key === 'actions' ? 'nowrap' : undefined,
                                        boxShadow: idx === 0 ? '2px 0 5px rgba(0,0,0,0.1)' : (col.key === 'actions' ? '-2px 0 5px rgba(0,0,0,0.1)' : 'none'),
                                        borderBottom: '1px solid #e2e8f0',
                                        padding: '12px 16px'
                                    }}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id}>
                                    {columns.map((col, idx) => {
                                        const isFirst = idx === 0;
                                        const isLast = col.key === 'actions';

                                        if (isLast) return (
                                            <td key="actions" style={{
                                                position: 'sticky', right: 0, zIndex: 10,
                                                backgroundColor: 'white',
                                                whiteSpace: 'nowrap',
                                                minWidth: '100px',
                                                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                                                borderBottom: '1px solid #e2e8f0',
                                                padding: '12px 16px'
                                            }}>
                                                <button className="btn btn-sm btn-outline">Edit</button>
                                            </td>
                                        );

                                        return (
                                            <td key={col.key} style={{
                                                position: isFirst ? 'sticky' : 'static',
                                                left: isFirst ? 0 : 'auto',
                                                zIndex: isFirst ? 10 : 1,
                                                backgroundColor: 'white',
                                                boxShadow: isFirst ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
                                                borderRight: '1px solid #e2e8f0',
                                                borderBottom: '1px solid #e2e8f0',
                                                padding: '12px 16px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '200px',
                                                fontSize: '13px'
                                            }}
                                                title={String(asset[col.key as keyof TrackCircuitAsset] || '')}>
                                                {String(asset[col.key as keyof TrackCircuitAsset] || '')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
                <PaginationControls
                    currentPage={page}
                    totalPages={meta?.totalPages || 1}
                    totalItems={meta?.total || 0}
                    onPageChange={setPage}
                    loading={loading}
                />
            </div>
        </div>
    );
}
