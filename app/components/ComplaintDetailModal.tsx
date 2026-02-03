'use client';

import { Complaint } from '@/app/types';

interface ComplaintDetailModalProps {
    complaint: Complaint | null;
    onClose: () => void;
}

export default function ComplaintDetailModal({ complaint, onClose }: ComplaintDetailModalProps) {
    if (!complaint) return null;

    const formatDate = (dateStr: string | Date | undefined) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'closed':
            case 'resolved':
                return '#22c55e';
            case 'open':
                return '#ef4444';
            case 'pending':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
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
                            Complaint Details
                        </h2>
                        <div style={{
                            display: 'inline-block',
                            background: getStatusColor(complaint.status),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            Status: {complaint.status.toUpperCase()}
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
                        {/* Complaint Information */}
                        {renderInfoBox('Complaint Information', (
                            <>
                                {renderField('Complaint ID', complaint.id ? complaint.id.substring(0, 12) : 'N/A')}
                                {renderField('Date Raised', formatDate(complaint.date))}
                                {renderField('Created Date', formatDate(complaint.createdAt))}
                                {renderField('Raised By', complaint.authorName)}
                                {renderField('Category', complaint.category)}
                                {renderField('Status', complaint.status.toUpperCase())}
                            </>
                        ))}

                        {/* Failure Information */}
                        {renderInfoBox('Failure Information', (
                            <>
                                {renderField('Description', complaint.description)}
                                {renderField('Assigned To', complaint.supervisorId ? 'Superior' : 'Not Assigned')}
                            </>
                        ))}
                    </div>

                    {/* Additional Details */}
                    {(complaint.actualFailureDetails) && renderInfoBox('Additional Details', (
                        <>
                            {renderField('Actual Failure Details', complaint.actualFailureDetails)}
                        </>
                    ), true)}

                    {/* Resolution Information */}
                    {(complaint.status === 'Closed') && (
                        <>
                            {renderInfoBox('Resolution Information', (
                                <>
                                    {renderField('Resolved By', complaint.resolvedBy)}
                                    {renderField('Resolved Date', formatDate(complaint.resolvedDate))}
                                    {renderField('RT Time', complaint.rtTime)}
                                    {renderField('Train Detention', complaint.trainDetention || 'None')}
                                </>
                            ), true)}

                            {complaint.rectificationDetails && renderInfoBox('Rectification Details', (
                                <div style={{
                                    padding: '12px',
                                    background: '#f0fdf4',
                                    borderRadius: '6px',
                                    borderLeft: '4px solid #22c55e'
                                }}>
                                    <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b', fontSize: '13px' }}>
                                        {complaint.rectificationDetails}
                                    </p>
                                </div>
                            ), true)}
                        </>
                    )}

                    {/* Open Status Message */}
                    {complaint.status === 'Open' && (
                        <div style={{
                            padding: '16px',
                            background: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginTop: '20px'
                        }}>
                            <span style={{ fontSize: '24px' }}>⏳</span>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '4px', color: '#92400e' }}>Pending Resolution</div>
                                <div style={{ fontSize: '13px', color: '#92400e' }}>
                                    This complaint is awaiting resolution by SSE or JE.
                                </div>
                            </div>
                        </div>
                    )}
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
