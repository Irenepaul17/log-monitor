'use client';

import { useEffect, useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { WorkReport } from '@/app/types';

interface WorkReportDetailModalProps {
    report: WorkReport | null;
    onClose: () => void;
}

interface ResolvedAttachment {
    name: string;
    url: string;
    type: string;
}

export default function WorkReportDetailModal({ report, onClose }: WorkReportDetailModalProps) {
    const { complaints } = useGlobal();
    const [resolvedAttachments, setResolvedAttachments] = useState<ResolvedAttachment[]>([]);

    // Load signed S3 URLs for any attachment keys stored in this report
    useEffect(() => {
        if (!report?.attachments || report.attachments.length === 0) {
            setResolvedAttachments([]);
            return;
        }
        const isS3Key = (s: string) => s.startsWith('attachments/');
        const keys = report.attachments.filter(isS3Key);
        if (keys.length === 0) return;

        Promise.all(
            keys.map(async (key) => {
                const res = await fetch(`/api/upload/signed-url?key=${encodeURIComponent(key)}`);
                const { url } = await res.json();
                // Guess type from file extension
                const ext = key.split('.').pop()?.toLowerCase() || '';
                const type = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : 'application/pdf';
                const name = key.split('-').slice(1).join('-'); // strip UUID prefix
                return { name, url, type } as ResolvedAttachment;
            })
        ).then(setResolvedAttachments).catch(console.error);
    }, [report]);

    if (!report) return null;

    const formatDate = (dateValue: string | Date | undefined) => {
        if (!dateValue) return 'N/A';
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Calculate status logic for Failure reports
    const isFailure = report.classification.toUpperCase() === 'FAILURE';
    const linkedComplaint = isFailure ? complaints.find((c: any) =>
        // 1. Direct ID match (rare but possible in test data)
        c.id === report.id ||
        // 2. Logic match
        (
            c.authorId === report.authorId &&
            (
                // Relaxed description match (Complaint description contains Report description)
                (report.details?.failure?.details && c.description.toLowerCase().includes(report.details.failure.details.toLowerCase())) ||
                // Fallback to strict category + date match
                (c.category === report.details?.failure?.gear && c.date === report.date)
            )
        )
    ) : null;

    // If a linked failure record exists, mirror its status.
    // If this is a FAILURE report but no linked failure is found,
    // show a neutral "NOT RAISED" status instead of implying it is still open.
    const displayStatus = linkedComplaint
        ? linkedComplaint.status.toUpperCase()
        : (isFailure ? 'NOT RAISED' : 'SUBMITTED');
    const statusBg = linkedComplaint && linkedComplaint.status === 'Open' ? '#ef4444' : '#22c55e';


    const renderInfoBox = (title: string, content: React.ReactNode, fullWidth = false) => (
        <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            background: 'white',
            gridColumn: fullWidth ? '1 / -1' : 'auto'
        }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#2563eb',
                marginBottom: '16px'
            }}>
                {title}
            </h3>
            {content}
        </div>
    );

    const renderField = (label: string, value: any) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        return (
            <div style={{ marginBottom: '10px', display: 'flex' }}>
                <span style={{
                    fontWeight: 400,
                    color: '#64748b',
                    minWidth: '160px',
                    fontSize: '13px'
                }}>{label}:</span>
                <span style={{
                    flex: 1,
                    color: '#1e293b',
                    fontSize: '13px',
                    fontWeight: 500
                }}>
                    {Array.isArray(value) ? value.join(', ') : value}
                </span>
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                maxWidth: '1200px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '2px solid #e2e8f0',
                    background: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#2563eb',
                            marginBottom: '8px'
                        }}>
                            Technician's Log Book Details
                        </h2>
                        <div style={{
                            display: 'inline-block',
                            background: statusBg,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            Status: {displayStatus}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '0',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#1e293b';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Two Column Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {/* Request Information */}
                        {renderInfoBox('Request Information', (
                            <>
                                {renderField('Report ID', report.id.substring(0, 12))}
                                {renderField('Date', formatDate(report.date))}
                                {renderField('Created Date', formatDate(report.date))}
                                {renderField('Requested By', report.authorName)}
                                {renderField('Department', 'S&T')}
                                {renderField('Section', report.sseSection)}
                                {renderField('Request Type', report.classification.toUpperCase().replace(/_/g, ' '))}
                            </>
                        ))}

                        {/* Work Details */}
                        {renderInfoBox('Work Details', (
                            <>
                                {renderField('Work Type', report.classification.toUpperCase())}
                                {renderField('Activity', report.classification)}
                                {renderField('Station', report.station)}
                                {renderField('Shift', report.shift)}
                                {renderField('SSE Section', report.sseSection)}
                                {isFailure ? (
                                    <div style={{ marginBottom: '10px', display: 'flex' }}>
                                        <span style={{ fontWeight: 400, color: '#64748b', minWidth: '160px', fontSize: '13px' }}>Status:</span>
                                        <span style={{
                                            flex: 1,
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: statusBg
                                        }}>
                                            {displayStatus}
                                        </span>
                                    </div>
                                ) : (
                                    renderField('Status', 'Completed')
                                )}
                            </>
                        ))}
                    </div>

                    {/* Work Details Section */}
                    {report.details.maintenance && renderInfoBox('Maintenance Work Details', (
                        <>
                            {renderField('Gears Maintained', report.details.maintenance.gears)}
                            {renderField('Details', report.details.maintenance.text)}
                            {report.details.maintenance.other && renderField('Other', report.details.maintenance.other)}
                        </>
                    ), true)}

                    {/* Failure Details */}
                    {report.details.failure && renderInfoBox('Failure Details', (
                        <>
                            {renderField('Status', report.details.failure.status)}
                            {renderField('Gear Failed', report.details.failure.gear)}
                            {renderField('Failure Type', report.details.failure.type)}
                            {renderField('In Time', report.details.failure.inTime)}
                            {renderField('RT Time', report.details.failure.rtTime)}
                            {renderField('Classification', report.details.failure.classification)}
                            {renderField('Details', report.details.failure.details)}
                            {renderField('Actual Details', report.details.failure.actualDetails)}
                            {renderField('Preventive Details', report.details.failure.preventiveDetails)}
                        </>
                    ), true)}

                    {/* S&T Special Work */}
                    {report.details.specialWork && renderInfoBox('S&T Special Work', (
                        <>
                            {renderField('Work Done On', report.details.specialWork.on)}
                            {renderField('Details', report.details.specialWork.text)}
                        </>
                    ), true)}

                    {/* Disconnection Details */}
                    {report.details.disconnection && renderInfoBox('Disconnection Details', (
                        <>
                            {renderField('Status', report.details.disconnection.status)}
                            {renderField('Permission', report.details.disconnection.permission)}
                            {renderField('Disconnection No.', report.details.disconnection.no)}
                            {renderField('Disconnection For', report.details.disconnection.for)}
                            {renderField('Disconnection Date', report.details.disconnection.discDate)}
                            {renderField('Disconnection Time', report.details.disconnection.discTime)}
                            {renderField('Reconnection Date', report.details.disconnection.reconDate)}
                            {renderField('Reconnection Time', report.details.disconnection.reconTime)}
                        </>
                    ), true)}

                    {/* Replacement Details */}
                    {report.details.replacement && renderInfoBox('Replacement Details', (
                        <>
                            {renderField('Gear Replaced', report.details.replacement.gear)}
                            {renderField('Reason', report.details.replacement.detailsReason)}

                            {report.details.replacement.trackDCTC && (
                                <>
                                    <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: '#2563eb', fontSize: '13px' }}>
                                        Track DCTC:
                                    </div>
                                    {renderField('Track No.', report.details.replacement.trackDCTC.trackNo)}
                                    {renderField('Asset Replaced', report.details.replacement.trackDCTC.asset)}
                                </>
                            )}

                            {report.details.replacement.signal && (
                                <>
                                    <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: '#2563eb', fontSize: '13px' }}>
                                        Signal:
                                    </div>
                                    {renderField('Signal No.', report.details.replacement.signal.no)}
                                    {renderField('Type', report.details.replacement.signal.type)}
                                    {renderField('Aspect', report.details.replacement.signal.aspect)}
                                </>
                            )}

                            {report.details.replacement.battery && (
                                <>
                                    <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: '#2563eb', fontSize: '13px' }}>
                                        Battery:
                                    </div>
                                    {renderField('Circuit Type', report.details.replacement.battery.type)}
                                    {renderField('Asset Name', report.details.replacement.battery.assetName)}
                                    {renderField('Cells', report.details.replacement.battery.cells)}
                                    {renderField('Make', report.details.replacement.battery.make)}
                                    {renderField('Capacity', report.details.replacement.battery.capacity)}
                                    {renderField('Install Date', report.details.replacement.battery.installDate)}
                                </>
                            )}

                            {report.details.replacement.relay && (
                                <>
                                    <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: '#2563eb', fontSize: '13px' }}>
                                        Old Relay:
                                    </div>
                                    {renderField('Type', report.details.replacement.relay.old.type)}
                                    {renderField('Make', report.details.replacement.relay.old.make)}
                                    {renderField('Serial', report.details.replacement.relay.old.serial)}

                                    <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: '#2563eb', fontSize: '13px' }}>
                                        New Relay:
                                    </div>
                                    {renderField('Type', report.details.replacement.relay.new.type)}
                                    {renderField('Make', report.details.replacement.relay.new.make)}
                                    {renderField('Serial', report.details.replacement.relay.new.serial)}
                                </>
                            )}
                        </>
                    ), true)}

                    {/* Other Department Work */}
                    {report.details.otherDept && renderInfoBox('Work with Other Departments', (
                        <>{renderField('Details', report.details.otherDept)}</>
                    ), true)}

                    {/* Miscellaneous */}
                    {report.details.misc && renderInfoBox('Miscellaneous Work', (
                        <>{renderField('Details', report.details.misc)}</>
                    ), true)}

                    {/* Train Detention */}
                    {report.details.trainDetention && renderInfoBox('Train Detention', (
                        <>{renderField('Details', report.details.trainDetention)}</>
                    ), true)}

                    {/* Attachments (S3) */}
                    {resolvedAttachments.length > 0 && renderInfoBox(`Attachments (${resolvedAttachments.length})`, (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                            {resolvedAttachments.map((file, i) =>
                                file.type.startsWith('image/') ? (
                                    <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" title={file.name} style={{ display: 'block' }}>
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'zoom-in' }}
                                        />
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                    </a>
                                ) : (
                                    <a key={i} href={file.url} download={file.name} style={{ textDecoration: 'none' }}>
                                        <div style={{ width: '100%', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5', cursor: 'pointer', gap: '6px' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>PDF</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                    </a>
                                )
                            )}
                        </div>
                    ), true)}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '2px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    position: 'sticky',
                    bottom: 0,
                    background: 'white'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
}
