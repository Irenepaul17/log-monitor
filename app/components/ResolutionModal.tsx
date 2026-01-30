"use client";

import React, { useState } from 'react';
import { Complaint } from '../context/GlobalContext';

interface ResolutionModalProps {
    complaint: Complaint;
    onClose: () => void;
    onResolve: (resolutionData: {
        rtTime: string;
        actualFailureDetails: string;
        trainDetention: string;
        rectificationDetails: string;
    }) => Promise<void>;
}

export function ResolutionModal({ complaint, onClose, onResolve }: ResolutionModalProps) {
    const [rtTime, setRtTime] = useState('');
    const [actualFailureDetails, setActualFailureDetails] = useState('');
    const [trainDetention, setTrainDetention] = useState('');
    const [rectificationDetails, setRectificationDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onResolve({
                rtTime,
                actualFailureDetails,
                trainDetention,
                rectificationDetails
            });
            onClose();
        } catch (error) {
            console.error('Failed to resolve complaint:', error);
            alert('Failed to resolve complaint. Please try again.');
        } finally {
            setIsSubmitting(false);
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
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                        Resolve Complaint
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: 'var(--muted)',
                            padding: '0',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <strong>Category:</strong> {complaint.category}
                    </div>
                    <div>
                        <strong>Description:</strong> {complaint.description}
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="rtTime">
                            RT Time <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            id="rtTime"
                            type="time"
                            value={rtTime}
                            onChange={(e) => setRtTime(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="actualFailureDetails">
                            Actual Failure Details <span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea
                            id="actualFailureDetails"
                            value={actualFailureDetails}
                            onChange={(e) => setActualFailureDetails(e.target.value)}
                            required
                            rows={3}
                            placeholder="Enter actual failure details for analysis"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="trainDetention">
                            Train Detention
                        </label>
                        <input
                            id="trainDetention"
                            type="text"
                            value={trainDetention}
                            onChange={(e) => setTrainDetention(e.target.value)}
                            placeholder="Record train detention if any"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label htmlFor="rectificationDetails">
                            Failure Rectification Details <span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea
                            id="rectificationDetails"
                            value={rectificationDetails}
                            onChange={(e) => setRectificationDetails(e.target.value)}
                            required
                            rows={4}
                            placeholder="Describe how the failure was rectified"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                background: 'var(--primary)',
                                color: 'white',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 500,
                                opacity: isSubmitting ? 0.6 : 1
                            }}
                        >
                            {isSubmitting ? 'Resolving...' : 'Resolve Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
