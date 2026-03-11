'use client';

import { useState, useEffect } from 'react';
import { SignalAsset, SignalEquipment } from '@/app/types/assets';
import { usePaginatedData } from '@/app/hooks/usePaginatedData';
import { PaginationControls } from '@/app/components/PaginationControls';
import { useGlobal } from '@/app/context/GlobalContext';

export default function SignalAssetsPage() {
    const { currentUser } = useGlobal();
    const isOfficer = ['sr-dste', 'dste', 'adste'].includes(currentUser?.role || '');
    const isSSE = currentUser?.role === 'sse';
    const isFieldStaff = ['je', 'technician'].includes(currentUser?.role || '');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<SignalAsset | null>(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const {
        data: assets,
        meta,
        loading,
        page,
        setPage,
        refresh
    } = usePaginatedData<SignalAsset>(
        '/api/assets/signal',
        { search: debouncedSearch },
        10
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Basic debounce
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const [formData, setFormData] = useState<Partial<SignalAsset>>({
        sno: '',
        section: '',
        stationAutoSectionLcIbs: '',
        route: '',
        signalNoShuntNo: '',
        signalType: '',
        lhsRhs: '',
        smmsAssetCreated: '',
        assetApprovedByInChargeSSE: '',
        rg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        hg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        hhg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        dg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        shunt: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        routeEquipment: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        amarker: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        callingon: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
        aspect2: '',
        aspect3: '',
        aspect4: '',
        shuntConfig: '',
        ind: '',
        onPost: '',
        co: '',
        routeConfig: '',
        home: '',
        starter: '',
        ib: '',
        gatesig: '',
        auto: '',
        retroReflectiveSignalNo: ''
    });

    useEffect(() => {
        if (editingAsset) {
            setFormData(editingAsset);
            setIsAddModalOpen(true);
        }
    }, [editingAsset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Frontend safety net: ensure all core required fields are filled
            // These should stay in sync with REQUIRED_FIELDS for 'signal' in lib/asset-approval.ts
            const requiredFields: (keyof SignalAsset)[] = ['section', 'signalNoShuntNo'];
            const missing = requiredFields.filter((field) => {
                const value = (formData[field] as any ?? '').toString().trim();
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
            const response = await fetch('/api/assets/signal/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: editingAsset?.id || null,
                    proposedData: formData,
                    requester: {
                        id: currentUser?.id,
                        name: currentUser?.name,
                        role: currentUser?.role,
                        teamId: currentUser?.teamId
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit request');
            }

            const result = await response.json();

            if (currentUser?.role === 'sse') {
                alert('Asset updated successfully (Audit trail logged).');
            } else {
                alert('Your changes have been submitted to SSE for approval.');
            }

            setIsAddModalOpen(false);
            setEditingAsset(null);
            resetForm();
            refresh();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this signal asset?')) return;

        try {
            const response = await fetch(`/api/assets/signal/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete asset');

            refresh();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            sno: '',
            section: '',
            stationAutoSectionLcIbs: '',
            route: '',
            signalNoShuntNo: '',
            signalType: '',
            lhsRhs: '',
            smmsAssetCreated: '',
            assetApprovedByInChargeSSE: '',
            rg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            hg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            hhg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            dg: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            shunt: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            routeEquipment: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            amarker: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            callingon: { make: '', type: '', slNo: '', dom: '', doi: '', qty: 0 },
            aspect2: '',
            aspect3: '',
            aspect4: '',
            shuntConfig: '',
            ind: '',
            onPost: '',
            co: '',
            routeConfig: '',
            home: '',
            starter: '',
            ib: '',
            gatesig: '',
            auto: '',
            retroReflectiveSignalNo: ''
        });
        setActiveTab('basic');
    };

    const updateEquipment = (category: keyof Pick<SignalAsset, 'rg' | 'hg' | 'hhg' | 'dg' | 'shunt' | 'routeEquipment' | 'amarker' | 'callingon'>, field: keyof SignalEquipment, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] || {}),
                [field]: value
            }
        }));
    };

    const renderEquipmentTableFields = (category: keyof Pick<SignalAsset, 'rg' | 'hg' | 'hhg' | 'dg' | 'shunt' | 'routeEquipment' | 'amarker' | 'callingon'>, label: string) => (
        <tr key={category}>
            <td style={{ fontWeight: 600 }}>{label}</td>
            <td><input type="text" value={formData[category]?.make || ''} onChange={(e) => updateEquipment(category, 'make', e.target.value)} /></td>
            <td><input type="text" value={formData[category]?.type || ''} onChange={(e) => updateEquipment(category, 'type', e.target.value)} /></td>
            <td><input type="text" value={formData[category]?.slNo || ''} onChange={(e) => updateEquipment(category, 'slNo', e.target.value)} /></td>
            <td><input type="date" value={formData[category]?.dom || ''} onChange={(e) => updateEquipment(category, 'dom', e.target.value)} min="1990-01-01" max={new Date().toISOString().split('T')[0]} /></td>
            <td><input type="date" value={formData[category]?.doi || ''} onChange={(e) => updateEquipment(category, 'doi', e.target.value)} min="1990-01-01" max={new Date().toISOString().split('T')[0]} /></td>
            <td><input type="number" value={formData[category]?.qty || 0} onChange={(e) => updateEquipment(category, 'qty', parseInt(e.target.value) || 0)} /></td>
        </tr>
    );

    const columns = [
        { key: 'stationAutoSectionLcIbs', label: 'STAT SECT', minWidth: '150px' },
        { key: 'sno', label: 'SNO', minWidth: '80px' },
        { key: 'section', label: 'SECTION', minWidth: '100px' },
        { key: 'route', label: 'ROUTE', minWidth: '100px' },
        { key: 'signalNoShuntNo', label: 'SIGNAL NO/SHUNT NO', minWidth: '150px' },
        { key: 'signalType', label: 'HOME/STARTER/LSS/CO/IND SH/SUB SH/AUTO/GATE/IB/REP', minWidth: '300px' },
        { key: 'lhsRhs', label: 'LHS/RHS', minWidth: '80px' },
        { key: 'smmsAssetCreated', label: 'SMMS Asset Created', minWidth: '150px' },
        { key: 'assetApprovedByInChargeSSE', label: 'Asset Approved by In Charge SSE', minWidth: '180px' },

        // RG Equipment
        { key: 'rg.make', label: 'RG - MAKE', minWidth: '120px' },
        { key: 'rg.type', label: 'RG - TYPE', minWidth: '120px' },
        { key: 'rg.slNo', label: 'RG - Sl No', minWidth: '100px' },
        { key: 'rg.dom', label: 'RG - DOM', minWidth: '100px' },
        { key: 'rg.doi', label: 'RG - DOI', minWidth: '100px' },

        // HG Equipment
        { key: 'hg.make', label: 'HG - MAKE', minWidth: '120px' },
        { key: 'hg.type', label: 'HG - TYPE', minWidth: '120px' },
        { key: 'hg.slNo', label: 'HG - Sl No', minWidth: '100px' },
        { key: 'hg.dom', label: 'HG - DOM', minWidth: '100px' },
        { key: 'hg.doi', label: 'HG - DOI', minWidth: '100px' },

        // HHG Equipment
        { key: 'hhg.make', label: 'HHG - MAKE', minWidth: '120px' },
        { key: 'hhg.type', label: 'HHG - TYPE', minWidth: '120px' },
        { key: 'hhg.slNo', label: 'HHG - Sl No', minWidth: '100px' },
        { key: 'hhg.dom', label: 'HHG - DOM', minWidth: '100px' },
        { key: 'hhg.doi', label: 'HHG - DOI', minWidth: '100px' },

        // DG Equipment
        { key: 'dg.make', label: 'DG - MAKE', minWidth: '120px' },
        { key: 'dg.type', label: 'DG - TYPE', minWidth: '120px' },
        { key: 'dg.slNo', label: 'DG - Sl No', minWidth: '100px' },
        { key: 'dg.dom', label: 'DG - DOM', minWidth: '100px' },
        { key: 'dg.doi', label: 'DG - DOI', minWidth: '100px' },

        // Shunt Equipment
        { key: 'shunt.make', label: 'SHUNT - MAKE', minWidth: '120px' },
        { key: 'shunt.type', label: 'SHUNT - TYPE', minWidth: '120px' },
        { key: 'shunt.slNo', label: 'SHUNT - Sl No', minWidth: '100px' },
        { key: 'shunt.dom', label: 'SHUNT - DOM', minWidth: '100px' },
        { key: 'shunt.doi', label: 'SHUNT - DOI', minWidth: '100px' },

        // Route Equipment
        { key: 'routeEquipment.make', label: 'ROUTE - MAKE', minWidth: '120px' },
        { key: 'routeEquipment.type', label: 'ROUTE - TYPE', minWidth: '120px' },
        { key: 'routeEquipment.slNo', label: 'ROUTE - Sl No', minWidth: '100px' },
        { key: 'routeEquipment.dom', label: 'ROUTE - DOM', minWidth: '100px' },
        { key: 'routeEquipment.doi', label: 'ROUTE - DOI', minWidth: '100px' },

        // AMARKER Equipment
        { key: 'amarker.make', label: 'AMARKER - MAKE', minWidth: '120px' },
        { key: 'amarker.type', label: 'AMARKER - TYPE', minWidth: '120px' },
        { key: 'amarker.slNo', label: 'AMARKER - Sl No', minWidth: '100px' },
        { key: 'amarker.dom', label: 'AMARKER - DOM', minWidth: '100px' },
        { key: 'amarker.doi', label: 'AMARKER - DOI', minWidth: '100px' },

        // Calling On Equipment
        { key: 'callingon.make', label: 'CALLINGON - MAKE', minWidth: '120px' },
        { key: 'callingon.type', label: 'CALLINGON - TYPE', minWidth: '120px' },
        { key: 'callingon.slNo', label: 'CALLINGON - Sl No', minWidth: '100px' },
        { key: 'callingon.dom', label: 'CALLINGON - DOM', minWidth: '100px' },
        { key: 'callingon.doi', label: 'CALLINGON - DOI', minWidth: '100px' },

        // Configurations
        { key: 'aspect2', label: '2 ASPECT', minWidth: '100px' },
        { key: 'aspect3', label: '3 ASPECT', minWidth: '100px' },
        { key: 'aspect4', label: '4 ASPECT', minWidth: '100px' },
        { key: 'shuntConfig', label: 'SHUNT', minWidth: '100px' },
        { key: 'ind', label: 'IND', minWidth: '80px' },
        { key: 'onPost', label: 'ON POST', minWidth: '100px' },
        { key: 'co', label: 'CO', minWidth: '80px' },
        { key: 'routeConfig', label: 'ROUTE', minWidth: '100px' },
        { key: 'home', label: 'HOME', minWidth: '100px' },
        { key: 'starter', label: 'STARTER', minWidth: '100px' },
        { key: 'ib', label: 'IB', minWidth: '80px' },
        { key: 'gatesig', label: 'GATE SIG', minWidth: '100px' },
        { key: 'auto', label: 'AUTO', minWidth: '80px' },
        { key: 'retroReflectiveSignalNo', label: 'Retro Reflective Signal No', minWidth: '200px' },

        { key: 'actions', label: 'Actions', minWidth: '150px' }
    ];

    return (
        <div className="screen active" style={{ display: "block" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Signal Assets</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search Signal No, Section..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="input"
                        style={{ width: '250px' }}
                    />
                    {!isOfficer && (
                        <button
                            className="btn btn-primary"
                            onClick={() => { setEditingAsset(null); resetForm(); setIsAddModalOpen(true); }}
                        >
                            + Add Signal Asset
                        </button>
                    )}
                    <a href={currentUser?.role === 'sse' ? '/dashboard/sse' : '/'} className="btn btn-outline">
                        Back to Dashboard
                    </a>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', marginBottom: '20px', padding: 0 }}>
                {loading ? <p>Loading...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} style={{
                                        position: (col.key === 'stationAutoSectionLcIbs' || col.key === 'actions') ? 'sticky' : 'static',
                                        left: col.key === 'stationAutoSectionLcIbs' ? 0 : 'auto',
                                        right: col.key === 'actions' ? 0 : 'auto',
                                        zIndex: (col.key === 'stationAutoSectionLcIbs' || col.key === 'actions') ? 20 : 1,
                                        backgroundColor: 'white',
                                        minWidth: col.minWidth,
                                        fontSize: '12px',
                                        wordBreak: 'break-word',
                                        whiteSpace: col.key === 'actions' ? 'nowrap' : undefined,
                                        boxShadow: col.key === 'stationAutoSectionLcIbs' ? '2px 0 5px rgba(0,0,0,0.1)' : (col.key === 'actions' ? '-2px 0 5px rgba(0,0,0,0.1)' : 'none'),
                                        borderRight: '1px solid #e2e8f0'
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
                                                position: 'sticky',
                                                right: 0,
                                                zIndex: 10,
                                                backgroundColor: 'white',
                                                whiteSpace: 'nowrap',
                                                minWidth: '160px',
                                                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                                                borderLeft: '1px solid #e2e8f0'
                                            }}>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => { setEditingAsset(asset); setIsAddModalOpen(true); }}>
                                                        {isOfficer ? 'View' : 'Edit'}
                                                    </button>
                                                    {(isSSE) && (
                                                        <button className="btn btn-sm btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(asset.id)}>Delete</button>
                                                    )}
                                                </div>
                                            </td>
                                        );

                                        let cellValue: any = '';
                                        if (col.key.includes('.')) {
                                            const [cat, field] = col.key.split('.');
                                            cellValue = (asset as any)[cat]?.[field];
                                        } else {
                                            cellValue = (asset as any)[col.key];
                                        }

                                        const isFirstColumn = col.key === 'stationAutoSectionLcIbs';
                                        return (
                                            <td key={col.key} style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '220px',
                                                fontSize: '13px',
                                                position: isFirstColumn ? 'sticky' : 'static',
                                                left: isFirstColumn ? 0 : 'auto',
                                                backgroundColor: 'white',
                                                zIndex: isFirstColumn ? 10 : 1,
                                                boxShadow: isFirstColumn ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
                                                borderRight: '1px solid #e2e8f0'
                                            }}
                                                title={String(cellValue || '')}>
                                                {String(cellValue || '')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {meta && (
                <div style={{ marginTop: '20px', padding: '0 24px 24px 24px' }}>
                    <PaginationControls
                        currentPage={page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        onPageChange={setPage}
                        loading={loading}
                    />
                </div>
            )}

            {isAddModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '24px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>{editingAsset ? 'Edit Signal Asset' : 'Add New Signal Asset'}</h3>
                            <button onClick={() => { setIsAddModalOpen(false); setEditingAsset(null); resetForm(); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
                            {['basic', 'equipment', 'led'].map(tab => (
                                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{
                                    padding: '10px 20px', background: activeTab === tab ? '#2563eb' : 'transparent',
                                    color: activeTab === tab ? 'white' : '#64748b', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer'
                                }}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {activeTab === 'basic' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                    {[
                                        { key: 'sno', label: 'SNO' },
                                        { key: 'section', label: 'SECTION *', required: true },
                                        { key: 'stationAutoSectionLcIbs', label: 'STATION/AUTOSECTION/LC/IBS *', required: true },
                                        { key: 'route', label: 'ROUTE' },
                                        { key: 'signalNoShuntNo', label: 'SIGNAL NO/SHUNT NO *', required: true },
                                        { key: 'signalType', label: 'HOME/STARTER/LSS/CO/IND SH/SUB SH/AUTO/GATE/IB/REP' },
                                        { key: 'lhsRhs', label: 'LHS/RHS' },
                                        { key: 'smmsAssetCreated', label: 'SMMS Asset Created' },
                                        { key: 'assetApprovedByInChargeSSE', label: 'Asset Approved by In Charge SSE' }
                                    ].map(field => (
                                        <div key={field.key} className="form-group">
                                            <label>{field.label}</label>
                                            <input type="text" required={field.required} value={(formData as any)[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'equipment' && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left' }}>Category</th>
                                                <th>MAKE</th>
                                                <th>TYPE</th>
                                                <th>Sl No</th>
                                                <th>DOM</th>
                                                <th>DOI</th>
                                                <th>QTY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {renderEquipmentTableFields('rg', 'RG')}
                                            {renderEquipmentTableFields('hg', 'HG')}
                                            {renderEquipmentFieldsRow('hhg', 'HHG')}
                                            {renderEquipmentFieldsRow('dg', 'DG')}
                                            {renderEquipmentFieldsRow('shunt', 'SHUNT')}
                                            {renderEquipmentFieldsRow('routeEquipment', 'ROUTE')}
                                            {renderEquipmentFieldsRow('amarker', 'AMARKER')}
                                            {renderEquipmentFieldsRow('callingon', 'CALLINGON')}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'led' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                    {[
                                        { key: 'aspect2', label: '2Aspect' },
                                        { key: 'aspect3', label: '3Aspect' },
                                        { key: 'aspect4', label: '4Aspect' },
                                        { key: 'co', label: 'CO' },
                                        { key: 'route', label: 'Route' },
                                        { key: 'shuntSh', label: 'Shunt (SH)' },
                                        { key: 'subSh', label: 'Sub (SH)' },
                                        { key: 'retroReflectiveSignalNo', label: 'Retro Reflective Signal No.' }
                                    ].map(field => (
                                        <div key={field.key} className="form-group">
                                            <label>{field.label}</label>
                                            <input type="text" value={(formData as any)[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                {!isOfficer && (
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        {isFieldStaff ? 'Submit for Approval' : (editingAsset ? 'Update' : 'Create')}
                                    </button>
                                )}
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setIsAddModalOpen(false); setEditingAsset(null); resetForm(); }}>
                                    {isOfficer ? 'Close' : 'Cancel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    function renderEquipmentFieldsRow(category: any, label: string) {
        return renderEquipmentTableFields(category, label);
    }
}
