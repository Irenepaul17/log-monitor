"use client";

import React, { useState } from 'react';
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';
import { EIAsset } from '@/app/types/assets';
import EIAssetForm from '@/app/components/EIAssetForm';

export default function EIAssetsPage() {
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
            const res = await fetch('/api/assets/ei', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setIsCreateModalOpen(false);
                refresh();
            } else {
                alert('Failed to create asset');
            }
        } catch (e) {
            console.error(e);
            alert('Error creating asset');
        }
    };

    const handleUpdate = async (data: Partial<EIAsset>) => {
        if (!editingAsset) return;
        try {
            const res = await fetch(`/api/assets/ei/${editingAsset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setEditingAsset(null);
                refresh();
            } else {
                alert('Failed to update asset');
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

            <div className="card">
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading assets...</div>
                    ) : (
                        <table style={{ minWidth: '4000px' }}>
                            <thead>
                                <tr>
                                    <th style={{ position: 'sticky', left: 0, zIndex: 20, backgroundColor: 'white', minWidth: '100px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>SSE SEC</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Station/Section</th>
                                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Station / Auto Section</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>SECTION</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>Route</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Make</th>
                                    <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>No. of Routes</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>State</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Date of Installation</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>FY</th>
                                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Centralised / Distributed</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>No of OCs</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>RDSO Typical Circuit</th>
                                    <th style={{ minWidth: '350px', whiteSpace: 'nowrap' }}>Power cable redundancy (IPS to EI)</th>
                                    <th style={{ minWidth: '300px', whiteSpace: 'nowrap' }}>T.D.C for Redundant Power Cable</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Dual VDU/Panel+ VDU etc</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>VDU 1 Make & Model</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>VDU 1 Date of Manufacture</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>VDU 1 Last Replacement</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>VDU 2 Make & Model</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>VDU 2 Date of Manufacture</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>VDU 2 Last Replacement</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>PC 1 Make & Model</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>PC 1 Date of Manufacture</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>PC 1 Last Replacement</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>PC 2 Make & Model</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>PC 2 Date of Manufacture</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>PC 2 Last Replacement</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Power supply to VDU 1</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Power supply to VDU 2</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Temp Files Deletion Status</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>HOT/WARM STAND BY</th>
                                    <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>EI Version</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Latest Upgrade</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Upgraded / Not Upgraded</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Up Graded Date</th>
                                    <th style={{ minWidth: '300px', whiteSpace: 'nowrap' }}>MT AVAILABLE INSIDE/OUTSIDE RELAY ROOM</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Warranty / AMC</th>
                                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Period of WARR/ AMC From</th>
                                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Period of WARR/ AMC To</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>AC PROVIDED / NOT PROVIDED</th>
                                    <th style={{ minWidth: '300px', whiteSpace: 'nowrap' }}>BATTERY CHARGER (Conv/Ripple Free)</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Emergency Route Release counter</th>
                                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Register Availability</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>S&T KEY For EMRC</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>Codal Life</th>
                                    <th style={{ minWidth: '300px', whiteSpace: 'nowrap' }}>Managed Network Switch (PFC)</th>
                                    <th style={{ minWidth: '300px', whiteSpace: 'nowrap' }}>Comm Link Indication on VDU</th>
                                    <th style={{ minWidth: '300px', whiteSpace: 'nowrap' }}>System A/B Failure Indication on VDU</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Last Date of AMC</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>AMC Time From</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>AMC Time To</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Work done During AMC</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Deficiency noted during AMC</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Spare Card Available Details</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Spare Cards Last Tested Date</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Availablity of Emergency Panel</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Date of Provision of Emg Panel</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>Status of Emergency Panel working</th>
                                    <th style={{ position: 'sticky', right: 0, zIndex: 20, backgroundColor: 'white', minWidth: '160px', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset) => (
                                    <tr key={asset.id}>
                                        <td style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'white', whiteSpace: 'nowrap', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>{asset.sseSection}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.station}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.stationAutoSection}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.section}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.route}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.make}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.numberOfRoutes}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.state}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.dateOfInstallation}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.financialYear}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.centralisedDistributed}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.numberOfOCs}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.rdsoTypicalCircuit}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.powerCableRedundancy}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.tdcRedundantPowerCable}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.systemType}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu1MakeModel}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu1ManufactureDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu1LastReplacementDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu2MakeModel}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu2ManufactureDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu2LastReplacementDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.pc1MakeModel}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.pc1ManufactureDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.pc1LastReplacementDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.pc2MakeModel}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.pc2ManufactureDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.pc2LastReplacementDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu1PowerSupply}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.vdu2PowerSupply}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.tempFilesDeletionStatus}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.standbyMode}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.eiVersion}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.latestUpgrade}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.upgradeStatus}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.upgradeDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.mtRelayRoomStatus}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.warrantyAmcStatus}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.warrantyAmcFrom}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.warrantyAmcTo}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.acProvider}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.batteryChargerType}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.emergencyRouteReleaseCounter}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.registerAvailability}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.emrcKeyHolder}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.codalLife}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.networkSwitchStatus}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.commLinkIndication}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.systemFailureIndication}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.amcLastDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.amcFrom}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.amcTo}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.amcWorkDone}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.amcDeficiency}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.spareCardDetails}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.spareCardTestDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.emergencyPanelAvailability}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.emergencyPanelProvisionDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{asset.emergencyPanelStatus}</td>
                                        <td style={{ position: 'sticky', right: 0, zIndex: 10, backgroundColor: 'white', minWidth: '160px', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)' }}>
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
                        <PaginationControls
                            currentPage={page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={setPage}
                            loading={loading}
                        />
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
