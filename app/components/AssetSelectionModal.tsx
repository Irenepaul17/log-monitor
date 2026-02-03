"use client";

import React from "react";

interface AssetSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AssetSelectionModal({ isOpen, onClose }: AssetSelectionModalProps) {
    if (!isOpen) return null;

    const assets = [
        { name: "Point", icon: "" },
        { name: "Signal", icon: "" },
        { name: "EI", icon: "" },
        { name: "Track Circuit", icon: "" },
    ];

    const handleSelect = (assetName: string) => {
        if (assetName === "EI") {
            window.location.href = "/dashboard/assets/ei";
            return;
        }
        // Placeholder action for now
        alert(`You selected: ${assetName}. Details page coming soon!`);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                margin: '20px',
                animation: 'slideIn 0.3s ease-out'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Select Asset Type</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: 'var(--muted)'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {assets.map((asset) => (
                        <button
                            key={asset.name}
                            onClick={() => handleSelect(asset.name)}
                            className="btn btn-outline"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px',
                                gap: '10px',
                                height: '120px',
                                fontSize: '16px',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                borderColor: 'var(--border)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.backgroundColor = 'var(--primary-soft)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {asset.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
