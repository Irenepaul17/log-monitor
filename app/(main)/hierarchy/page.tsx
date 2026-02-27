"use client";

import React, { useState } from 'react';
import { useGlobal } from '@/app/context/GlobalContext';
import { User, Role } from '@/app/types';

const ROLE_LABELS: Record<Role, string> = {
    "sr-dste": "Sr. DSTE",
    "dste": "DSTE",
    "adste": "ADSTE",
    "sse": "SSE",
    "je": "JE",
    "technician": "Technician"
};

const ROLE_COLORS: Record<Role, { bg: string, text: string }> = {
    "sr-dste": { bg: "#fef2f2", text: "#991b1b" },
    "dste": { bg: "#fff7ed", text: "#9a3412" },
    "adste": { bg: "#f0fdf4", text: "#166534" },
    "sse": { bg: "#ecfdf5", text: "#065f46" },
    "je": { bg: "#eff6ff", text: "#1e40af" },
    "technician": { bg: "#f8fafc", text: "#475569" }
};

const ROLE_ORDER: Record<string, number> = {
    "adste": 1,
    "sse": 2,
    "je": 3,
    "technician": 4,
    "dste": 5,
    "sr-dste": 6
};

export default function HierarchyPage() {
    const { currentUser, users } = useGlobal();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!currentUser) return <div style={{ padding: '40px', textAlign: 'center' }}>Please login...</div>;

    // Sort team members based on defined role order
    const sortedMembers = [...users].sort((a, b) => {
        return (ROLE_ORDER[a.role] || 99) - (ROLE_ORDER[b.role] || 99);
    });

    const isSSE = currentUser.role === 'sse';
    const canAddUser = isSSE;

    return (
        <div className="screen active" style={{ display: 'block', padding: '24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Team Directory</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                            {currentUser.division} Section • {users.length} total members
                        </p>
                    </div>
                    {canAddUser && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                background: '#1e293b',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px'
                            }}
                        >
                            + Add Team Member
                        </button>
                    )}
                </div>

                <div className="card" style={{ padding: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                                    <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                    <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PF Number</th>
                                    <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMembers.length > 0 ? sortedMembers.map((user) => {
                                    const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.technician;
                                    const isSelf = user.id === currentUser.id;

                                    return (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'default' }} className="user-row">
                                            <style jsx>{`
                                                .user-row:hover { background: #f8fafc; }
                                            `}</style>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: roleStyle.bg,
                                                        color: roleStyle.text,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '14px',
                                                        border: `1px solid ${roleStyle.text}20`
                                                    }}>
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {user.name}
                                                            {isSelf && (
                                                                <span style={{
                                                                    fontSize: '10px',
                                                                    padding: '2px 6px',
                                                                    background: '#e0f2fe',
                                                                    color: '#0369a1',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 800
                                                                }}>YOU</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    background: roleStyle.bg,
                                                    color: roleStyle.text,
                                                    display: 'inline-block',
                                                    border: `1px solid ${roleStyle.text}20`
                                                }}>
                                                    {ROLE_LABELS[user.role].toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                                                {user.pfNumber}
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>
                                                {user.phone}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                            No team members found in this section.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <AddUserModal
                    onClose={() => setIsModalOpen(false)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

function AddUserModal({ onClose, currentUser }: { onClose: () => void, currentUser: User }) {
    const { addUser } = useGlobal();
    const [form, setForm] = useState({
        name: "", phone: "", email: "", pass: "", pfNumber: "", role: "" as Role | ""
    });

    const allowedRoles: Role[] = ["je", "technician"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.role) return;

        await addUser({
            ...form,
            role: form.role as Role,
            sub: ROLE_LABELS[form.role as Role],
            superiorId: currentUser.id,
            teamId: currentUser.teamId,
            division: currentUser?.division || 'Unknown'
        });

        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '480px', maxWidth: '95%', padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Add New Member</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                        <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="text" placeholder="e.g. Rohit Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                            <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} required>
                                <option value="">Select...</option>
                                {allowedRoles.map(r => (
                                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>PF Number</label>
                            <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="text" placeholder="PFXXXXXX" value={form.pfNumber} onChange={e => setForm({ ...form, pfNumber: e.target.value })} required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number (ID)</label>
                        <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="text" placeholder="10-digit mobile" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Email</label>
                        <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="email" placeholder="name@railnet.gov.in" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px' }}>Create Member</button>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600 }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
