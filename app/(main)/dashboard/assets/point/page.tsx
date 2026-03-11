"use client";

import { useState, useEffect } from "react";
import { useGlobal } from "@/app/context/GlobalContext";
import { useRouter } from "next/navigation";
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';
import { PointAsset } from "@/app/types/assets";

interface PointAssetFormProps {
    initialData?: PointAsset;
    onSubmit: (data: Partial<PointAsset>) => void;
    onCancel: () => void;
}

function PointAssetForm({ initialData, onSubmit, onCancel }: PointAssetFormProps) {
    const [formData, setFormData] = useState<Partial<PointAsset>>(initialData || {
        sseSection: "", station: "", pointNo: "", lineType: "Main Line", atKm: "", locationNumber: "",
        layout: "", throw: "143MM", endType: "Single End", pointMachineSlNo: "", yearOfManufacture: "", make: "", installedDate: "",
        motorSlNo: "", motorType: "NORMAL", motorMake: "",
        facingPoint: "No", antiTheftNut: "No", antiTheftNutStatus: "Not provided", dateInstallAntiTheftFasteners: "",
        pBracketProtection: "No", dateInstallPBracketProtection: "", lostMotionStretcherBarProtection: "No", dateInstallLostMotionProtection: "",
        lastDatePointInsulationReplaced: "", duePointInsulationReplacement: "", ssdInsulation: "N/A",
        michuangWaterLogging: "No", fullySubmergedHeavyRain: "No",
        galvanizedGroundConnections: "No", dateProvisionGalvanizedRoddings: "", fyProvisionGalvanizedRoddings: "",
        msFlatTieBarDetails: "No", ercMkIIIReplacement: "No", insulatingLinerReplacement: "No",
        circuit: "", noOfQBCARelays: 0, pointGroupParallelingDone: "No",
        wcrABDateManufacture: "", wcrABDateTested: "", wczr1DateManufacture: "", wczr1DateTested: "",
        nwczrDateManufacture: "", nwczrDateTested: "", rwczrDateManufacture: "", rwczrDateTested: ""
    });

    const [activeTab, setActiveTab] = useState("location");

    const handleChange = (field: keyof PointAsset, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderInput = (label: string, field: keyof PointAsset, type: string = "text", required: boolean = false, options?: string[]) => (
        <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '13px' }}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>
            {options ? (
                <select
                    value={(formData[field] as string) || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    style={{
                        width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                >
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    value={(formData[field] as string) || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    style={{
                        width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                    required={required}
                />
            )}
        </div>
    );

    const tabs = [
        { id: "location", label: "Location & General" },
        { id: "technical", label: "Technical & Motor" },
        { id: "safety", label: "Safety & Protection" },
        { id: "insulation", label: "Insulation & Water" },
        { id: "relays", label: "Relays & Checklists" },
    ];

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', gap: '5px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 15px',
                            background: activeTab === tab.id ? '#2563eb' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '6px 6px 0 0',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                {activeTab === "location" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {renderInput("SSE Section", "sseSection", "text", true)}
                        {renderInput("Station", "station", "text", true)}
                        {renderInput("Point No", "pointNo", "text", true)}
                        {renderInput("Line Type", "lineType", "text", false, ["Main Line", "LoopLine"])}
                        {renderInput("At Km", "atKm")}
                        {renderInput("Location Number", "locationNumber")}
                        {renderInput("Installed Date", "installedDate", "date")}
                    </div>
                )}
                {activeTab === "technical" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {renderInput("Layout", "layout")}
                        {renderInput("Throw", "throw", "text", false, ["143MM", "220MM"])}
                        {renderInput("End Type", "endType", "text", false, ["Single End", "Double End"])}
                        {renderInput("Point Machine Sl No", "pointMachineSlNo")}
                        {renderInput("Year of Manufacture", "yearOfManufacture")}
                        {renderInput("Make", "make")}
                        {renderInput("Motor Sl No", "motorSlNo")}
                        {renderInput("Motor Type", "motorType", "text", false, ["IP67", "NORMAL"])}
                        {renderInput("Motor Make", "motorMake")}
                    </div>
                )}
                {activeTab === "safety" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {renderInput("Facing Point", "facingPoint", "text", false, ["Yes", "No"])}
                        {renderInput("Anti-Theft Nut", "antiTheftNut", "text", false, ["Yes", "No"])}
                        {renderInput("Anti-Theft Nut Status", "antiTheftNutStatus", "text", false, ["Full Set", "Partial", "Not provided"])}
                        {renderInput("Date Install Anti-Theft Fasteners", "dateInstallAntiTheftFasteners", "date")}
                        {renderInput("P-Bracket Protection", "pBracketProtection", "text", false, ["Yes", "No"])}
                        {renderInput("Date Install P-Bracket Prot.", "dateInstallPBracketProtection", "date")}
                        {renderInput("Lost Motion Stretcher Bar Prot.", "lostMotionStretcherBarProtection", "text", false, ["Yes", "No"])}
                        {renderInput("Date Install Lost Motion Prot.", "dateInstallLostMotionProtection", "date")}
                    </div>
                )}
                {activeTab === "insulation" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {renderInput("Last Date Insulation Replaced", "lastDatePointInsulationReplaced", "date")}
                        {renderInput("Due Insulation Replacement", "duePointInsulationReplacement", "date")}
                        {renderInput("SSD Insulation", "ssdInsulation", "text", false, ["Claw", "T type", "N/A"])}
                        {renderInput("Michuang Water Logging", "michuangWaterLogging", "text", false, ["Yes", "No"])}
                        {renderInput("Fully Submerged Heavy Rain", "fullySubmergedHeavyRain", "text", false, ["Yes", "No"])}
                        {renderInput("Galvanized Ground Connections", "galvanizedGroundConnections", "text", false, ["Yes", "No"])}
                        {renderInput("Date Provision Galv. Roddings", "dateProvisionGalvanizedRoddings", "date")}
                        {renderInput("FY Provision Galv. Roddings", "fyProvisionGalvanizedRoddings")}
                    </div>
                )}
                {activeTab === "relays" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {renderInput("MS Flat Tie Bar Details", "msFlatTieBarDetails", "text", false, ["Yes", "No"])}
                        {renderInput("ERC Mk-III Replacement", "ercMkIIIReplacement", "text", false, ["Yes", "No"])}
                        {renderInput("Insulating Liner Replacement", "insulatingLinerReplacement", "text", false, ["Yes", "No"])}
                        {renderInput("Circuit", "circuit")}
                        {renderInput("No. of QBCA1 Relays", "noOfQBCARelays", "number")}
                        {renderInput("Point Group Parelling Done", "pointGroupParallelingDone", "text", false, ["Yes", "No"])}

                        <div style={{ gridColumn: '1 / -1', marginTop: '10px', fontWeight: 600, color: '#2563eb' }}>Relay Dates (Manufacture / Tested)</div>
                        {renderInput("WCR A/B Mfg Date", "wcrABDateManufacture", "date")}
                        {renderInput("WCR A/B Tested Date", "wcrABDateTested", "date")}
                        {renderInput("WCZR1 Mfg Date", "wczr1DateManufacture", "date")}
                        {renderInput("WCZR1 Tested Date", "wczr1DateTested", "date")}
                        {renderInput("NWCZR Mfg Date", "nwczrDateManufacture", "date")}
                        {renderInput("NWCZR Tested Date", "nwczrDateTested", "date")}
                        {renderInput("RWCZR Mfg Date", "rwczrDateManufacture", "date")}
                        {renderInput("RWCZR Tested Date", "rwczrDateTested", "date")}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Point Asset</button>
            </div>
        </form>
    );
}

export default function PointAssetsPage() {
    const { currentUser } = useGlobal();
    const router = useRouter();
    const [isAddUserId, setIsAddModalOpen] = useState(false); // Using similar var name pattern for modal state
    const [editingAsset, setEditingAsset] = useState<PointAsset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const {
        data: assets,
        loading,
        page,
        setPage,
        meta,
        refresh
    } = usePaginatedData<PointAsset>(
        '/api/assets/point',
        { search: debouncedSearch },
        10,
        true
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Basic debounce
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const handleSubmit = async (data: Partial<PointAsset>) => {
        try {
            // Frontend safety net: ensure all core required fields are filled
            const requiredFields: (keyof PointAsset)[] = ['sseSection', 'station', 'pointNo', 'lineType'];
            const missing = requiredFields.filter((field) => {
                const value = (data[field] ?? '').toString().trim();
                return !value;
            });

            if (missing.length > 0) {
                alert(
                    `Please fill all required fields before submitting:\n\n` +
                    missing.join(', ')
                );
                return;
            }

            // ALL asset changes (including SSE) now go through the request flow
            // for a complete audit trail. SSE requests are auto-approved in the backend.
            const res = await fetch('/api/assets/point/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: editingAsset?.id || null,
                    proposedData: data,
                    requester: {
                        id: currentUser?.id,
                        name: currentUser?.name,
                        role: currentUser?.role,
                        teamId: currentUser?.teamId
                    }
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Operation failed');
                return;
            }

            if (currentUser?.role === 'sse') {
                alert('Asset updated successfully (Audit trail logged).');
            } else {
                alert('Your changes have been submitted to SSE for approval.');
            }

            refresh();
            setEditingAsset(null);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this Point asset?')) return;

        try {
            const res = await fetch(`/api/assets/point/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete');
        }
    };

    const columns: { key: keyof PointAsset | 'actions', label: string, minWidth: string }[] = [
        { key: 'sseSection', label: 'SSE Section', minWidth: '120px' },
        { key: 'station', label: 'STATION', minWidth: '120px' },
        { key: 'pointNo', label: 'Point No', minWidth: '100px' },
        { key: 'lineType', label: 'Main Line / LoopLine', minWidth: '180px' },
        { key: 'layout', label: 'LAYOUT', minWidth: '100px' },
        { key: 'throw', label: '143MM / 220MM', minWidth: '150px' },
        { key: 'facingPoint', label: 'Facing Point', minWidth: '120px' },
        { key: 'antiTheftNut', label: 'Anti-Theft Nut', minWidth: '130px' },
        { key: 'antiTheftNutStatus', label: 'Anti-Theft Nut Full Set /Partial/ Not provided', minWidth: '200px' },
        { key: 'dateInstallAntiTheftFasteners', label: 'Date Installation of anti theft fastners', minWidth: '280px' },
        { key: 'pBracketProtection', label: 'provision of plates for protection of P-Bracket is done', minWidth: '380px' },
        { key: 'dateInstallPBracketProtection', label: 'Date Installation of provision of plates for protection of P-Bracket is done', minWidth: '250px' },
        { key: 'lostMotionStretcherBarProtection', label: 'provision of plates for protection of Lost Motion Stretcher bar is done', minWidth: '250px' },
        { key: 'dateInstallLostMotionProtection', label: 'Date of installation of Lost Motion Stretcher bar is done', minWidth: '250px' },
        { key: 'lastDatePointInsulationReplaced', label: 'Last Date of Point Insulation Replaced', minWidth: '200px' },
        { key: 'duePointInsulationReplacement', label: 'Due Point Insulation Replacement', minWidth: '200px' },
        { key: 'michuangWaterLogging', label: 'MICHUANG WATER LOGGING (Fully Submerged for Very Heavy rain)', minWidth: '250px' },
        { key: 'fullySubmergedHeavyRain', label: 'Fully Submerged for Heavy rain', minWidth: '200px' },
        { key: 'galvanizedGroundConnections', label: 'Galvanized Ground Connections', minWidth: '200px' },
        { key: 'dateProvisionGalvanizedRoddings', label: 'Date of Provision of Point Galvanized Roddings', minWidth: '250px' },
        { key: 'fyProvisionGalvanizedRoddings', label: 'FY of Provision of Point Galvanized Roddings', minWidth: '250px' },
        { key: 'pointMachineSlNo', label: 'POINT MACHINE SL NO', minWidth: '180px' },
        { key: 'yearOfManufacture', label: 'Year of Manufacture', minWidth: '180px' },
        { key: 'make', label: 'Make', minWidth: '100px' },
        { key: 'installedDate', label: 'Installed Date', minWidth: '140px' },
        { key: 'motorSlNo', label: 'Motor Sl.No', minWidth: '120px' },
        { key: 'motorType', label: 'Motor Type IP67 / NORMAL', minWidth: '220px' },
        { key: 'motorMake', label: 'Motor Make', minWidth: '120px' },
        { key: 'atKm', label: 'At-Km', minWidth: '100px' },
        { key: 'locationNumber', label: 'Location Number', minWidth: '150px' },
        { key: 'ssdInsulation', label: 'SSD Insulation (Claw / T type) only for 220mm point machine', minWidth: '250px' },
        { key: 'msFlatTieBarDetails', label: '1. M.S. Flat tie bar to Drg. no. RDSO/T-9650 with bend used in sleepers on the opposite side of point machine & where dowel hole not given in existing sleeper, holes shall be drilled as per dowel position given in above drawing RDSO/T-6155', minWidth: '300px' },
        { key: 'ercMkIIIReplacement', label: "2. ERC's MK-III to Drg. no. RDSO/T- 3701 replaced with ERC's MK-V Drg. no. RDSO/T-5919 from sleeper no. 01 to 27 in existing track", minWidth: '300px' },
        { key: 'insulatingLinerReplacement', label: '3. insulating liner to Drg. no. RDSO/T- 3706 replaced with Metal liner to Drg. no. RDSO/T-3740 from sleeper no. 03 to 27 in existing track', minWidth: '300px' },
        { key: 'circuit', label: 'Circuit', minWidth: '100px' },
        { key: 'noOfQBCARelays', label: 'No. of QBCA1 Relays', minWidth: '160px' },
        { key: 'wcrABDateManufacture', label: 'WCR A/B  (Non RDSO) Date of Manufacture', minWidth: '300px' },
        { key: 'wcrABDateTested', label: 'WCR A/B (Non RDSO)Date Tested', minWidth: '280px' },
        { key: 'wczr1DateManufacture', label: 'WCZR1 (RDSO) Date of Manufacture', minWidth: '280px' },
        { key: 'wczr1DateTested', label: 'WCZR1 (RDSO) Date Tested', minWidth: '250px' },
        { key: 'nwczrDateManufacture', label: 'NWCZR  (RDSO) Date of Manufacture', minWidth: '300px' },
        { key: 'nwczrDateTested', label: 'NWCZR (RDSO) Date Tested', minWidth: '250px' },
        { key: 'rwczrDateManufacture', label: 'RWCZR  (RDSO) Date of Manufacture', minWidth: '300px' },
        { key: 'rwczrDateTested', label: 'RWCZR  (RDSO) Date Tested', minWidth: '250px' },
        { key: 'endType', label: 'Single End/Double End', minWidth: '180px' },
        { key: 'pointGroupParallelingDone', label: 'Point group paralleling Done', minWidth: '240px' },
        { key: 'actions', label: 'Action', minWidth: '160px' }
    ];

    if (!currentUser) return <div>Checking auth...</div>;

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div className="card full-width-card" style={{ maxWidth: '100%', overflow: 'hidden', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '24px 24px 0 24px' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>Point Assets Directory</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search Point No, Station..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="input"
                            style={{ width: '250px' }}
                        />
                        <button className="btn btn-primary" onClick={() => { setEditingAsset(null); setIsAddModalOpen(true); }}>+ Add New Point</button>
                        <button onClick={() => window.history.back()} className="btn btn-outline">
                            Back to Dashboard
                        </button>
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
                                        <th key={col.key as string} style={{
                                            position: col.key === 'sseSection' ? 'sticky' : (col.key === 'actions' ? 'sticky' : 'static'),
                                            left: col.key === 'sseSection' ? 0 : 'auto',
                                            right: col.key === 'actions' ? 0 : 'auto',
                                            zIndex: (col.key === 'sseSection' || col.key === 'actions') ? 20 : 1,
                                            backgroundColor: (col.key === 'sseSection' || col.key === 'actions') ? 'white' : 'var(--card-bg)',
                                            minWidth: col.minWidth,
                                            fontSize: '12px',
                                            wordBreak: 'break-word',
                                            whiteSpace: col.key === 'actions' ? 'nowrap' : undefined,
                                            boxShadow: col.key === 'sseSection' ? '2px 0 5px rgba(0,0,0,0.1)' : (col.key === 'actions' ? '-2px 0 5px rgba(0,0,0,0.1)' : 'none')
                                        }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset) => (
                                    <tr key={asset.id}>
                                        {columns.map(col => {
                                            if (col.key === 'actions') return (
                                                <td key="actions" style={{
                                                    position: 'sticky', right: 0, zIndex: 10,
                                                    backgroundColor: 'white',
                                                    whiteSpace: 'nowrap',
                                                    minWidth: '160px',
                                                    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
                                                }}>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => { setEditingAsset(asset); setIsAddModalOpen(true); }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                                            onClick={() => handleDelete(asset.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            );

                                            const isSticky = col.key === 'sseSection';
                                            return (
                                                <td key={col.key as string} style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '220px',
                                                    fontSize: '13px',
                                                    position: isSticky ? 'sticky' : 'static',
                                                    left: isSticky ? 0 : 'auto',
                                                    zIndex: isSticky ? 10 : 1,
                                                    backgroundColor: isSticky ? 'white' : 'transparent',
                                                    boxShadow: isSticky ? '2px 0 5px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                                    title={String(asset[col.key as keyof PointAsset] || "")}>
                                                    {String(asset[col.key as keyof PointAsset] || "")}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {assets.length === 0 && (
                                    <tr>
                                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No Point assets found. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div style={{ padding: '24px' }}>
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

            {/* Add/Edit Modal */}
            {(isAddUserId || editingAsset) && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '900px', maxWidth: '95vw', height: '90vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 700 }}>
                            {editingAsset ? 'Edit Point Asset' : 'Add New Point Asset'}
                        </h3>
                        <PointAssetForm
                            initialData={editingAsset || undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => { setIsAddModalOpen(false); setEditingAsset(null); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
