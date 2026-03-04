"use client";

import React from 'react';
import { useGlobal } from '@/app/context/GlobalContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { currentUser, logout, updateProfile } = useGlobal();
    const router = useRouter();
    const [isEditing, setIsEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        pfNumber: ''
    });

    React.useEffect(() => {
        if (!currentUser) {
            router.push('/');
        } else {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                pfNumber: currentUser.pfNumber
            });
        }
    }, [currentUser, router]);

    if (!currentUser) {
        return null;
    }

    const handleSave = async () => {
        setSaving(true);
        const success = await updateProfile(formData);
        setSaving(false);
        if (success) {
            setIsEditing(false);
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="screen active" style={{ display: 'block', padding: '0' }}>
            <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'var(--primary-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontSize: '32px',
                        fontWeight: 700
                    }}>
                        {currentUser.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
                            {currentUser.name}
                        </h2>
                        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14px' }}>
                            {currentUser.sub}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary"
                                style={{ padding: '8px 20px' }}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ padding: '8px 24px' }}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: currentUser.name,
                                            email: currentUser.email,
                                            phone: currentUser.phone,
                                            pfNumber: currentUser.pfNumber
                                        });
                                    }}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 24px' }}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        <button
                            onClick={logout}
                            className="btn btn-outline"
                            style={{ color: '#ef4444', borderColor: '#ef4444', padding: '8px 20px' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        marginBottom: '20px',
                        letterSpacing: '0.05em',
                    }}>
                        Contact Information
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div className="input-group">
                            <label style={{ fontSize: '13px', marginBottom: '6px' }}>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                readOnly={!isEditing}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    background: isEditing ? 'white' : '#f9fafb',
                                    borderColor: isEditing ? 'var(--primary)' : '#e5e7eb',
                                    fontWeight: isEditing ? 500 : 400
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '13px', marginBottom: '6px' }}>Official Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly={!isEditing}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    background: isEditing ? 'white' : '#f9fafb',
                                    borderColor: isEditing ? 'var(--primary)' : '#e5e7eb',
                                    fontWeight: isEditing ? 500 : 400
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '13px', marginBottom: '6px' }}>Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                readOnly={!isEditing}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{
                                    background: isEditing ? 'white' : '#f9fafb',
                                    borderColor: isEditing ? 'var(--primary)' : '#e5e7eb',
                                    fontWeight: isEditing ? 500 : 400
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '13px', marginBottom: '6px' }}>Employee ID (PF)</label>
                            <input
                                type="text"
                                value={formData.pfNumber}
                                readOnly={!isEditing}
                                onChange={e => setFormData({ ...formData, pfNumber: e.target.value })}
                                style={{
                                    background: isEditing ? 'white' : '#f9fafb',
                                    borderColor: isEditing ? 'var(--primary)' : '#e5e7eb',
                                    fontWeight: isEditing ? 500 : 400
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '13px', marginBottom: '6px' }}>Role</label>
                            <input type="text" readOnly value={currentUser.role.toUpperCase()} style={{ background: '#f9fafb', borderColor: '#e5e7eb' }} />
                        </div>
                        {currentUser.teamId && (
                            <div className="input-group">
                                <label style={{ fontSize: '13px', marginBottom: '6px' }}>Team</label>
                                <input type="text" readOnly value={`Team ${currentUser.teamId}`} style={{ background: '#f9fafb', borderColor: '#e5e7eb' }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
