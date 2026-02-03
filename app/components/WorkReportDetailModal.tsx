'use client';

import { useGlobal } from '../context/GlobalContext';
import { WorkReport } from '@/app/types';

interface WorkReportDetailModalProps {
    report: WorkReport | null;
    onClose: () => void;
}

export default function WorkReportDetailModal({ report, onClose }: WorkReportDetailModalProps) {
    const { complaints } = useGlobal();
    if (!report) return null;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
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

    const displayStatus = linkedComplaint ? linkedComplaint.status.toUpperCase() : (isFailure ? 'OPEN' : 'SUBMITTED');
    const statusBg = (linkedComplaint && linkedComplaint.status === 'Open') || (!linkedComplaint && isFailure) ? '#ef4444' : '#22c55e';


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
                            Work Report Details
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
