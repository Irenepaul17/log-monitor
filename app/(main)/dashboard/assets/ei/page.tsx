"use client";

import React, { useState } from 'react';
import { useGlobal } from '@/app/context/GlobalContext';
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';
import { EIAsset } from '@/app/types/assets';
import EIAssetForm from '@/app/components/EIAssetForm';

export default function EIAssetsPage() {
    const { currentUser } = useGlobal();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<EIAsset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const {
        data: assets,
        loading,
        page,
        setPage,
        meta,
        refresh
    } = usePaginatedData<EIAsset>(
        '/api/assets/ei',
        { search: debouncedSearch },
        10
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Basic debounce
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const handleCreate = async (data: Partial<EIAsset>) => {
        try {
            // Frontend safety net: ensure all core required fields are filled
            // These should stay in sync with REQUIRED_FIELDS for 'ei' in lib/asset-approval.ts
            const requiredFields: (keyof EIAsset)[] = ['serialNumber', 'sseSection', 'station'];
            const missing = requiredFields.filter((field) => {
                const value = (data[field] as any ?? '').toString().trim();
                return !value;
            });

            if (missing.length > 0) {
                alert(
                    `Please fill all required fields before submitting:\n\n` +
                    missing.join(', ')
                );
                return;
            }

            const res = await fetch('/api/assets/ei/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: null,
                    proposedData: data,
                    requester: {
                        id: currentUser?.id,
                        name: currentUser?.name,
                        role: currentUser?.role,
                        teamId: currentUser?.teamId
                    }
                })
            });

            // Note: Since this page doesn't use useGlobal directly in the viewed snippet, 
            // I should verify where currentUser comes from.
            // Looking at the imports, it doesn't have useGlobal. 
            // I'll add the hook if needed or assume it's available globally.
            // Wait, the viewed file doesn't have useGlobal. I'll fix that.

            if (res.ok) {
                alert('Request submitted successfully.');
                setIsCreateModalOpen(false);
                refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to submit request');
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting request');
        }
    };

    const handleUpdate = async (data: Partial<EIAsset>) => {
        if (!editingAsset) return;
        try {
            const requiredFields: (keyof EIAsset)[] = ['serialNumber', 'sseSection', 'station'];
            const missing = requiredFields.filter((field) => {
                const value = (data[field] as any ?? '').toString().trim();
                return !value;
            });

            if (missing.length > 0) {
                alert(
                    `Please fill all required fields before submitting:\n\n` +
                    missing.join(', ')
                );
                return;
            }

            const res = await fetch('/api/assets/ei/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: editingAsset.id,
                    proposedData: data,
                    requester: {
                        id: currentUser?.id,
                        name: currentUser?.name,
                        role: currentUser?.role,
                        teamId: currentUser?.teamId
                    }
                })
            });
            if (res.ok) {
                alert('Update request submitted.');
                setEditingAsset(null);
                refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to submit update request');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating asset');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const res = await fetch(`/api/assets/ei/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                refresh();
            } else {
                alert('Failed to delete asset');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting asset');
        }
    };

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Electronic Interlocking (EI) Assets</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search Station, Section..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="input"
                        style={{ width: '250px' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Add Asset
                    </button>
                    <a href="/dashboard/sse" className="btn btn-outline">
                        Back to Dashboard
                    </a>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading assets...</div>
                    ) : (
                        <table style={{ minWidth: '4000px', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <th style={{ position: 'sticky', left: 0, zIndex: 20, backgroundColor: 'white', minWidth: '100px', fontSize: '12px', wordBreak: 'break-word', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>SSE SEC</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Station/Section</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Station / Auto Section</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>SECTION</th>
                                    <th style={{ minWidth: '100px', fontSize: '12px', wordBreak: 'break-word' }}>Route</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Make</th>
                                    <th style={{ minWidth: '120px', fontSize: '12px', wordBreak: 'break-word' }}>No. of Routes</th>
                                    <th style={{ minWidth: '100px', fontSize: '12px', wordBreak: 'break-word' }}>State</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Date of Installation</th>
                                    <th style={{ minWidth: '100px', fontSize: '12px', wordBreak: 'break-word' }}>FY</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Centralised / Distributed</th>
                                    <th style={{ minWidth: '100px', fontSize: '12px', wordBreak: 'break-word' }}>No of OCs</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>RDSO Typical Circuit</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>Power cable redundancy (IPS to EI)</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>T.D.C for Redundant Power Cable</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Dual VDU/Panel+ VDU etc</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>VDU 1 Make & Model</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>VDU 1 Date of Manufacture</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>VDU 1 Last Replacement</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>VDU 2 Make & Model</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>VDU 2 Date of Manufacture</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>VDU 2 Last Replacement</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>PC 1 Make & Model</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>PC 1 Date of Manufacture</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>PC 1 Last Replacement</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>PC 2 Make & Model</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>PC 2 Date of Manufacture</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>PC 2 Last Replacement</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>Power supply to VDU 1</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>Power supply to VDU 2</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Temp Files Deletion Status</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>HOT/WARM STAND BY</th>
                                    <th style={{ minWidth: '120px', fontSize: '12px', wordBreak: 'break-word' }}>EI Version</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Latest Upgrade</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Upgraded / Not Upgraded</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Up Graded Date</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>MT AVAILABLE INSIDE/OUTSIDE RELAY ROOM</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Warranty / AMC</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>Period of WARR/ AMC From</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>Period of WARR/ AMC To</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>AC PROVIDED / NOT PROVIDED</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>BATTERY CHARGER (Conv/Ripple Free)</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Emergency Route Release counter</th>
                                    <th style={{ minWidth: '160px', fontSize: '12px', wordBreak: 'break-word' }}>Register Availability</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>S&T KEY For EMRC</th>
                                    <th style={{ minWidth: '100px', fontSize: '12px', wordBreak: 'break-word' }}>Codal Life</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>Managed Network Switch (PFC)</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>Comm Link Indication on VDU</th>
                                    <th style={{ minWidth: '200px', fontSize: '12px', wordBreak: 'break-word' }}>System A/B Failure Indication on VDU</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>Last Date of AMC</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>AMC Time From</th>
                                    <th style={{ minWidth: '150px', fontSize: '12px', wordBreak: 'break-word' }}>AMC Time To</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Work done During AMC</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Deficiency noted during AMC</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Spare Card Available Details</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Spare Cards Last Tested Date</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Availablity of Emergency Panel</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Date of Provision of Emg Panel</th>
                                    <th style={{ minWidth: '180px', fontSize: '12px', wordBreak: 'break-word' }}>Status of Emergency Panel working</th>
                                    <th style={{ position: 'sticky', right: 0, zIndex: 20, backgroundColor: 'white', minWidth: '160px', whiteSpace: 'nowrap', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset) => (
                                    <tr key={asset.id}>
                                        <td style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }} title={asset.sseSection}>{asset.sseSection}</td>
                                        {[asset.station, asset.stationAutoSection, asset.section, asset.route, asset.make, asset.numberOfRoutes, asset.state, asset.dateOfInstallation, asset.financialYear, asset.centralisedDistributed, asset.numberOfOCs, asset.rdsoTypicalCircuit, asset.powerCableRedundancy, asset.tdcRedundantPowerCable, asset.systemType, asset.vdu1MakeModel, asset.vdu1ManufactureDate, asset.vdu1LastReplacementDate, asset.vdu2MakeModel, asset.vdu2ManufactureDate, asset.vdu2LastReplacementDate, asset.pc1MakeModel, asset.pc1ManufactureDate, asset.pc1LastReplacementDate, asset.pc2MakeModel, asset.pc2ManufactureDate, asset.pc2LastReplacementDate, asset.vdu1PowerSupply, asset.vdu2PowerSupply, asset.tempFilesDeletionStatus, asset.standbyMode, asset.eiVersion, asset.latestUpgrade, asset.upgradeStatus, asset.upgradeDate, asset.mtRelayRoomStatus, asset.warrantyAmcStatus, asset.warrantyAmcFrom, asset.warrantyAmcTo, asset.acProvider, asset.batteryChargerType, asset.emergencyRouteReleaseCounter, asset.registerAvailability, asset.emrcKeyHolder, asset.codalLife, asset.networkSwitchStatus, asset.commLinkIndication, asset.systemFailureIndication, asset.amcLastDate, asset.amcFrom, asset.amcTo, asset.amcWorkDone, asset.amcDeficiency, asset.spareCardDetails, asset.spareCardTestDate, asset.emergencyPanelAvailability, asset.emergencyPanelProvisionDate, asset.emergencyPanelStatus].map((val, i) => (
                                            <td key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px', fontSize: '13px' }} title={String(val ?? '')}>{String(val ?? '')}</td>
                                        ))}
                                        <td style={{ position: 'sticky', right: 0, zIndex: 10, backgroundColor: 'white', minWidth: '160px', whiteSpace: 'nowrap', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => setEditingAsset(asset)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(asset.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {assets.length === 0 && (
                                    <tr><td colSpan={60} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    {meta && (
                        <div style={{ padding: '24px' }}>
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
            </div>

            {/* Create Modal */}
            {
                isCreateModalOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <h3 className="section-title">Add New EI Asset</h3>
                            <EIAssetForm
                                onSubmit={handleCreate}
                                onCancel={() => setIsCreateModalOpen(false)}
                            />
                        </div>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                editingAsset && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <h3 className="section-title">Edit EI Asset</h3>
                            <EIAssetForm
                                initialData={editingAsset}
                                onSubmit={handleUpdate}
                                onCancel={() => setEditingAsset(null)}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
