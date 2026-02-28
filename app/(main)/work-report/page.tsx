"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/app/context/GlobalContext';
import { FormRenderer } from './FormRenderer';
import { WORK_LOG_BOOK_SCHEMA, type Answers } from './formSchema';

// Updated SSE Station mappings based on available PDF text and feedback

export default function WorkReportPage() {
    const router = useRouter();
    const { currentUser, addReport, addComplaint } = useGlobal();

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [answers, setAnswers] = useState<Answers>({
        section: "MAS",
        station: "",
        date: today,
        shift: "Morning",
        classification: ""
    });

    // Attachments: store { name, key (S3), previewUrl (local blob), type }
    const [attachments, setAttachments] = useState<{ name: string; key: string; previewUrl: string; type: string }[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);


    const resetForm = () => {
        setAnswers({
            section: "MAS",
            station: "",
            date: today,
            shift: "Morning",
            classification: ""
        });
        setAttachments([]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        const validFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!validTypes.includes(file.type)) {
                alert(`"${file.name}" is not a valid type. Only JPG, PNG, GIF, PDF allowed.`);
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert(`"${file.name}" is too large. Max 10MB.`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;
        setUploadingFiles(true);

        try {
            const uploaded: { name: string; key: string; previewUrl: string; type: string }[] = [];

            for (const file of validFiles) {
                // 1. Get presigned upload URL from our API
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: file.name, fileType: file.type })
                });

                if (!res.ok) throw new Error('Failed to get upload URL');
                const { uploadUrl, key } = await res.json();

                // 2. Upload directly to S3
                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file
                });
                if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name} to S3`);

                // 3. Local preview URL for display before page reload
                const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
                uploaded.push({ name: file.name, key, previewUrl, type: file.type });
            }

            setAttachments(prev => [...prev, ...uploaded]);
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploadingFiles(false);
            e.target.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (submitAnother: boolean) => {
        if (!currentUser) return;
        // Removed finalConfirmation check

        try {
            const rawClass = answers.classification;
            let classification = '';
            if (rawClass === 'Maintenance') classification = 'maintenance';
            else if (rawClass === 'Failure Attention') classification = 'failure';
            else if (rawClass === 'S&T Special Work') classification = 'st';
            else if (rawClass === 'Select for entering Disconnection') classification = 'disconnection';
            else if (rawClass === 'Replacement of Assets') classification = 'replacement';
            else if (rawClass === 'Work with other Departments') classification = 'other';
            else if (rawClass === 'Miscellaneous') classification = 'misc';
            else classification = rawClass ? rawClass.toLowerCase().replace(/ /g, '_') : '';
            const specialWorkText =
                classification === 'st'
                    ? (answers.specialWorkOn === 'Track'
                        ? answers.specialWorkDetailsTrack
                        : answers.specialWorkOn === 'Signal'
                            ? answers.specialWorkDetailsSignal
                            : answers.specialWorkOn === 'Point'
                                ? answers.specialWorkDetailsPoint
                                : answers.specialWorkOn === 'Location Box'
                                    ? answers.specialWorkDetailsLocationBox
                                    : answers.specialWorkOn === 'Power Room'
                                        ? answers.specialWorkDetailsPowerRoom
                                        : answers.specialWorkOn === 'Relay room'
                                            ? answers.specialWorkDetailsRelayRoom
                                            : answers.specialWorkOn === 'LC Gate'
                                                ? answers.specialWorkDetailsLCGate
                                                : answers.specialWorkOn === 'HUT'
                                                    ? answers.specialWorkDetailsHUT
                                                    : answers.specialWorkOn === 'Auto Section'
                                                        ? answers.specialWorkDetailsAutoSection
                                                        : answers.specialWorkOn === 'Other'
                                                            ? answers.specialWorkDetailsOther
                                                            : '')
                    : '';
            const reportData = {
                date: answers.date,
                authorId: currentUser.id,
                authorName: currentUser.name,
                sseSection: answers.section,
                station: answers.station,
                shift: answers.shift === 'Other' ? (answers.shiftOther || 'Other') : answers.shift,
                classification,
                details: {
                    maintenance: classification === 'maintenance' ? { gears: answers.maintainedGears || [], text: answers.maintDetails || "", other: answers.maintainedGearsOther || "" } : null,
                    specialWork: classification === 'st' ? { on: answers.specialWorkOn || "", text: specialWorkText } : null,
                    otherDept: classification === 'other' ? (answers.otherDeptDetails || "") : null,
                    misc: classification === 'misc' ? (answers.miscDetails || "") : null,
                    failure: classification === 'failure' ? {
                        status: answers.failureStatus,
                        gear: answers.gearFailed,
                        type: answers.failureType || "",
                        inTime: answers.inTime,
                        rtTime: answers.rtTime,
                        classification: answers.failureClassification || "",
                        details: answers.failureDetails || "",
                        actualDetails: answers.actualFailureDetails || "",
                        preventiveDetails: answers.failurePreventiveDetails || ""
                    } : null,
                    disconnection: answers.hasDisconnection === 'Yes' ? {
                        status: answers.discStatus || "",
                        permission: answers.discPermission || "",
                        no: answers.discNo || "",
                        for: (answers.discFor === 'Other' ? (answers.discForOther || 'Other') : (answers.discFor || "")),
                        discDate: answers.discDate || "",
                        discTime: answers.discTime || "",
                        reconDate: answers.reconDate || "",
                        reconTime: answers.reconTime || ""
                    } : null,
                    replacement: classification === 'replacement' ? {
                        gear: answers.replaceGear,
                        detailsReason: answers.replacementReason || null,
                        trackDCTC: answers.replaceGear === 'Track (DCTC)' ? { trackNo: answers.dctcTrackNo, asset: answers.dctcAssetReplaced } : null,
                        trackAFTC: answers.replaceGear === 'Track (AFTC)' ? { trackNo: answers.aftcTrackNo, asset: answers.aftcAssetReplaced } : null,
                        signal: answers.replaceGear === 'Signal' ? { no: answers.signalNo, type: answers.signalType, aspect: answers.signalAspect } : null,
                        battery: answers.replaceGear === 'Battery' ? {
                            type: answers.batteryCircuit, assetName: answers.batteryAssetName, circuit: answers.batteryCircuitOther || "",
                            cells: answers.batteryCells, make: answers.batteryMake, capacity: answers.batteryCapacity, installDate: answers.batteryInstallDate
                        } : null,
                        relay: answers.replaceGear === 'Relay Room (Relay)' ? {
                            old: { type: answers.oldRelayType, make: answers.oldRelayMake, serial: answers.oldRelaySerial, contact: answers.oldRelayContact, lhrh: answers.oldRelayLHRH, kgs: answers.oldRelayKgs },
                            new: { type: answers.newRelayType, make: answers.newRelayMake, serial: answers.newRelaySerial, contact: answers.newRelayContact, lhrh: answers.newRelayLHRH, kgs: answers.newRelayKgs }
                        } : null,
                        generic: ['Point', 'Power Room', 'IPS', 'Relay Room (Other than Relay)', 'LC Gate', 'AFTC / MSDAC HUT', 'Auto Section', 'General'].includes(answers.replaceGear) ? {
                            oldMake: answers.genOldMake, oldSerial: answers.genOldSerial, oldDate: answers.genOldDate,
                            newMake: answers.genNewMake, newSerial: answers.genNewSerial, installDate: answers.genInstallDate
                        } : null,
                        joint: (answers.replaceGear === 'Glued Joint' || answers.replaceGear === 'RDSO Joint') ? {
                            type: answers.replaceGear,
                            name: answers.jointName,
                            failureType: answers.jointFailureType,
                            lhrh: answers.jointLHRH,
                            kgs: answers.jointKgs
                        } : null,
                    } : null,
                    finalConfirmation: "YES",
                    trainDetention: answers.trainDetention || ""
                },
                attachments: attachments.length > 0 ? attachments.map(a => a.key) : undefined
            };

            // Async Submission
            await addReport(reportData);
            console.log("Report submitted. Classification:", classification, "FailureStatus:", answers.failureStatus);


            // Auto-create failure for ANY failure report
            if (classification === 'failure' && answers.gearFailed) {
                console.log("Auto-generating failure for:", answers.gearFailed);
                await addComplaint({
                    authorId: currentUser.id,
                    authorName: currentUser.name,
                    category: 'Failure',
                    description: `Gear: ${answers.gearFailed}, Type: ${answers.failureType || 'Not specified'}, Classification: ${answers.failureClassification || 'Not specified'}, Details: ${answers.failureDetails || 'No details provided'}`,
                    supervisorId: currentUser.superiorId
                });
            }

            if (submitAnother) {
                alert("✅ Log entry submitted successfully! Form reset for another entry.");
                resetForm();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("✅ Log entry submitted successfully!");
                router.push(`/dashboard/${currentUser.role === 'technician' ? 'je' : currentUser.role}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("❌ Failed to submit log entry. Please check your internet connection and try again.\n\nError: " + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const setAnswer = (id: string, value: any) => {
        setAnswers(prev => {
            // Reset station when section changes (Google Form behavior)
            if (id === 'section') return { ...prev, section: value, station: "" };

            // Handle Disconnection pre-fill based on JSON label
            if (id === 'classification') {
                if (value === 'Select for entering Disconnection') {
                    return { ...prev, classification: value, hasDisconnection: 'Yes', discStatus: 'Applied' };
                }
                if (value === 'Only Disconnection filled and cancelled') {
                    return { ...prev, classification: value, hasDisconnection: 'Yes' };
                }
            }
            return { ...prev, [id]: value };
        });
    };

    return (
        <div className="screen active" style={{ display: 'block', paddingBottom: '100px' }}>
            <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Back Button */}
                <button
                    onClick={() => {
                        if (currentUser) {
                            const dashboardPath = currentUser.role === 'technician' ? 'je' : currentUser.role;
                            router.push(`/dashboard/${dashboardPath}`);
                        } else {
                            router.push('/');
                        }
                    }}
                    style={{
                        marginBottom: '20px',
                        padding: '10px 20px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                >
                    <span>←</span>
                    <span>Back to Dashboard</span>
                </button>

                <div className="section-title">TECHNICIAN'S LOG BOOK</div>

                <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                    <strong>GENERAL INSTRUCTIONS:</strong><br />
                    • Feed only one work at a time. Fields marked * are mandatory.<br />
                    • Enter disconnection details (if any) before submitting<br />
                    • If more than one work is done, use "SUBMIT & ENTER ANOTHER RESPONSE"
                </div>


                <div className="nested-container">
                    <div className="section-title" style={{ fontSize: '15px' }}>FORM</div>
                    <FormRenderer
                        schema={WORK_LOG_BOOK_SCHEMA}
                        answers={answers}
                        setAnswer={setAnswer}
                    />
                </div>

                {/* ATTACHMENTS - Optional for all classifications */}
                {answers.classification && (
                    <div className="nested-container">
                        <div className="section-title">ATTACHMENTS (Optional)</div>
                        <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '13px' }}>
                            📎 Attach photos or PDFs related to this work report (max 5MB per file)
                        </div>

                        <div className="input-group">
                            <label>Upload Files (Images: JPG, PNG, GIF | Documents: PDF) — max 10MB each</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                                multiple
                                onChange={handleFileUpload}
                                disabled={uploadingFiles}
                                style={{
                                    padding: '12px',
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer'
                                }}
                            />
                            {uploadingFiles && (
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
                                    ⏳ Uploading to secure storage...
                                </div>
                            )}
                        </div>

                        {attachments.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
                                    Attached Files ({attachments.length})
                                </div>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {attachments.map((file, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg)'
                                        }}>
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={file.previewUrl}
                                                    alt={file.name}
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover',
                                                        borderRadius: 'var(--radius-sm)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontWeight: 700,
                                                    fontSize: '12px'
                                                }}>
                                                    PDF
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{file.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                                    ✅ Uploaded to secure storage
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="btn btn-outline"
                                                style={{
                                                    color: '#ef4444',
                                                    borderColor: '#ef4444',
                                                    padding: '8px 16px',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* FINAL CONFIRMATION - Only visible if classification is selected */}
                {/* Submit Buttons - Only visible if classification is selected */}
                {answers.classification && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                            onClick={() => handleSubmit(false)}
                            disabled={!answers.classification || !answers.station}
                        >
                            SUBMIT FINAL REPORT
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ flex: 1.5 }}
                            onClick={() => handleSubmit(true)}
                            disabled={!answers.classification || !answers.station}
                        >
                            SUBMIT & ENTER ANOTHER RESPONSE
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ flex: 1 }}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
