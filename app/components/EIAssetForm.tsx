"use client";

import React, { useState } from 'react';
import { EIAsset } from '@/app/types/assets';

interface EIAssetFormProps {
    initialData?: Partial<EIAsset>;
    onSubmit: (data: Partial<EIAsset>) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function EIAssetForm({ initialData = {}, onSubmit, onCancel, loading = false }: EIAssetFormProps) {
    const [formData, setFormData] = useState<Partial<EIAsset>>(initialData);
    const [activeTab, setActiveTab] = useState('general');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const tabs = [
        { id: 'general', label: 'General Info' },
        { id: 'technical', label: 'Technical' },
        { id: 'hardware', label: 'Hardware (VDU/PC)' },
        { id: 'status', label: 'Status & Maint.' },
        { id: 'emergency', label: 'Emergency & Spares' }
    ];

    const renderField = (name: keyof EIAsset, label: string, type: string = 'text', options?: string[]) => (
        <div style={{ marginBottom: '15px' }} key={name}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                {label}
            </label>
            {type === 'select' && options ? (
                <select
                    name={name}
                    value={String(formData[name] || '')}
                    onChange={handleChange}
                    className="input"
                    style={{ width: '100%' }}
                >
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={String(formData[name] || '')}
                    onChange={handleChange}
                    className="input"
                    style={{ width: '100%' }}
                />
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '20px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            padding: '10px 0',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                {activeTab === 'general' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {renderField('serialNumber', 'S No')}
                        {renderField('sseSection', 'SSE Sec')}
                        {renderField('station', 'Station/Section')}
                        {renderField('stationAutoSection', 'Station / Auto Section')}
                        {renderField('section', 'Section')}
                        {renderField('route', 'Route')}
                        {renderField('make', 'Make')}
                        {renderField('numberOfRoutes', 'No. of Routes')}
                        {renderField('state', 'State')}
                        {renderField('dateOfInstallation', 'Date of Installation', 'date')}
                        {renderField('financialYear', 'Financial Year (FY)')}
                    </div>
                )}

                {activeTab === 'technical' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {renderField('centralisedDistributed', 'Centralised / Distributed')}
                        {renderField('numberOfOCs', 'No of OCs')}
                        {renderField('rdsoTypicalCircuit', 'RDSO Typical Circuit')}
                        {renderField('powerCableRedundancy', 'Power cable redundancy (IPS to EI)')}
                        {renderField('tdcRedundantPowerCable', 'T.D.C for Redundant Power Cable')}
                        {renderField('systemType', 'Dual VDU/Panel+ VDU etc')}
                    </div>
                )}

                {activeTab === 'hardware' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>VDU 1</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {renderField('vdu1MakeModel', 'Make & Model')}
                                {renderField('vdu1ManufactureDate', 'Date of Manufacture', 'date')}
                                {renderField('vdu1LastReplacementDate', 'Last Replacement', 'date')}
                                {renderField('vdu1PowerSupply', 'Power Supply')}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>VDU 2</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {renderField('vdu2MakeModel', 'Make & Model')}
                                {renderField('vdu2ManufactureDate', 'Date of Manufacture', 'date')}
                                {renderField('vdu2LastReplacementDate', 'Last Replacement', 'date')}
                                {renderField('vdu2PowerSupply', 'Power Supply')}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Embedded PC 1</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {renderField('pc1MakeModel', 'Make & Model')}
                                {renderField('pc1ManufactureDate', 'Date of Manufacture', 'date')}
                                {renderField('pc1LastReplacementDate', 'Last Replacement', 'date')}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Embedded PC 2</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {renderField('pc2MakeModel', 'Make & Model')}
                                {renderField('pc2ManufactureDate', 'Date of Manufacture', 'date')}
                                {renderField('pc2LastReplacementDate', 'Last Replacement', 'date')}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'status' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {renderField('tempFilesDeletionStatus', 'Temporary Files Deletion Status')}
                        {renderField('standbyMode', 'Standby Mode (Hot/Warm)')}
                        {renderField('eiVersion', 'EI Version')}
                        {renderField('latestUpgrade', 'Latest Upgrade')}
                        {renderField('upgradeStatus', 'Upgraded / Not Upgraded')}
                        {renderField('upgradeDate', 'Upgraded Date', 'date')}
                        {renderField('mtRelayRoomStatus', 'MT Available Inside/Outside Relay Room')}
                        {renderField('warrantyAmcStatus', 'Warranty / AMC')}
                        {renderField('warrantyAmcFrom', 'Period of WARR/AMC From', 'date')}
                        {renderField('warrantyAmcTo', 'Period of WARR/AMC To', 'date')}
                        {renderField('acProvider', 'AC Provided / Not Provided')}
                        {renderField('batteryChargerType', 'Battery Charger (Conventional/Ripple Free)')}
                        {renderField('amcLastDate', 'Last Date of AMC', 'date')}
                        {renderField('amcFrom', 'AMC Time From', 'date')}
                        {renderField('amcTo', 'AMC Time To', 'date')}
                        {renderField('amcWorkDone', 'Work Done During AMC')}
                        {renderField('amcDeficiency', 'Deficiency Noted During AMC')}
                    </div>
                )}

                {activeTab === 'emergency' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {renderField('emergencyRouteReleaseCounter', 'Emergency Route Release Counter')}
                        {renderField('registerAvailability', 'Register Availability')}
                        {renderField('emrcKeyHolder', 'S&T Key for EMRC Available With')}
                        {renderField('codalLife', 'Codal Life')}
                        {renderField('networkSwitchStatus', 'Availability of Managed Network Switch (PFC)')}
                        {renderField('commLinkIndication', 'Comm Link Indication on VDU')}
                        {renderField('systemFailureIndication', 'System A/B Failure Indication on VDU')}

                        {renderField('spareCardDetails', 'Spare Card Available Details')}
                        {renderField('spareCardTestDate', 'Spare Cards Last Tested Date', 'date')}

                        {renderField('emergencyPanelAvailability', 'Availability of Emergency Panel')}
                        {renderField('emergencyPanelProvisionDate', 'Date of Provision of Emergency Panel', 'date')}
                        {renderField('emergencyPanelStatus', 'Status of Emergency Panel Working')}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Asset'}
                </button>
            </div>
        </form>
    );
}
