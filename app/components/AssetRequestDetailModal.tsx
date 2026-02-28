"use client";

import React from "react";
import { AssetUpdateRequest } from "@/app/types";

interface Props {
    request: AssetUpdateRequest | null;
    onClose: () => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
    signalNoShuntNo: "Signal No / Shunt No",
    signalType: "Signal Type",
    lhsRhs: "LHS / RHS",
    section: "Section",
    route: "Route",
    station: "Station",
    sseSection: "SSE Section",
    stationAutoSection: "Station / Auto Section",
    stationAutoSectionLcIbs: "Station / Auto Section / LC / IBS",
    pointNo: "Point No",
    lineType: "Line Type",
    atKm: "At KM",
    make: "Make",
    installedDate: "Installed Date",
    yearOfManufacture: "Year of Manufacture",
    trackCircuitNo: "Track Circuit No",
    type: "Type",
    length: "Length",
    relayType: "Relay Type",
    serialNumber: "Serial Number",
    state: "State",
    dateOfInstallation: "Date of Installation",
    financialYear: "Financial Year",
    systemType: "System Type",
    eiVersion: "EI Version",
    numberOfRoutes: "Number of Routes",
    warrantyAmcStatus: "Warranty / AMC Status",
    codalLife: "Codal Life",
    smmsAssetCreated: "SMMS Asset Created",
    assetApprovedByInChargeSSE: "Approved by In-Charge SSE",
    rg: "RG",
    hg: "HG",
    hhg: "HHG",
    dg: "DG",
    shunt: "Shunt",
};

function formatValue(value: unknown): string {
    if (value === undefined || value === null || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        try {
            return new Date(value as string).toLocaleDateString('en-IN');
        } catch {
            return String(value);
        }
    }
    return String(value);
}

export default function AssetRequestDetailModal({ request, onClose, onApprove, onReject }: Props) {
    if (!request) return null;

    const proposedEntries = Object.entries(request.proposedData || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000, padding: '20px'
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px',
                maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8fafc'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                                fontWeight: 700, background: '#e0f2fe', color: '#0369a1',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                {request.assetType}
                            </span>
                            <span style={{
                                padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                                fontWeight: 700,
                                background: request.assetId ? '#fef9c3' : '#dcfce7',
                                color: request.assetId ? '#854d0e' : '#166534'
                            }}>
                                {request.assetId ? '✏️ Modification' : '✨ New Registration'}
                            </span>
                        </div>
                        <h3 style={{ margin: '6px 0 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                            Asset Approval Request
                        </h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                            Submitted by <strong>{request.requestedByName}</strong> on {new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9', border: 'none', borderRadius: '8px',
                            width: '32px', height: '32px', cursor: 'pointer',
                            fontSize: '18px', color: '#475569', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                        Proposed Changes
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {proposedEntries.map(([key, value]) => (
                            <div key={key} style={{
                                background: '#f8fafc', padding: '10px 14px',
                                borderRadius: '8px', border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                                    {FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>
                                    {formatValue(value)}
                                </div>
                            </div>
                        ))}
                        {proposedEntries.length === 0 && (
                            <div style={{ gridColumn: '1/-1', padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                No proposed data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                {(onApprove || onReject) && (
                    <div style={{
                        padding: '16px 24px', borderTop: '1px solid #e2e8f0',
                        display: 'flex', gap: '12px', justifyContent: 'flex-end',
                        background: '#f8fafc'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '9px 20px', borderRadius: '8px',
                                border: '1px solid #e2e8f0', background: 'white',
                                fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: '#475569'
                            }}
                        >
                            Close
                        </button>
                        {onReject && (
                            <button
                                onClick={() => { onReject(request.id); onClose(); }}
                                style={{
                                    padding: '9px 20px', borderRadius: '8px', border: '1px solid #ef4444',
                                    background: 'white', fontWeight: 600, fontSize: '14px',
                                    cursor: 'pointer', color: '#ef4444'
                                }}
                            >
                                Reject
                            </button>
                        )}
                        {onApprove && (
                            <button
                                onClick={() => { onApprove(request.id); onClose(); }}
                                style={{
                                    padding: '9px 20px', borderRadius: '8px', border: 'none',
                                    background: '#1e293b', fontWeight: 700, fontSize: '14px',
                                    cursor: 'pointer', color: 'white'
                                }}
                            >
                                ✓ Approve
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
