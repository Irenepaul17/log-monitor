"use client";

import React, { useState } from 'react';
import { useGlobal } from '@/app/context/GlobalContext';
import { User, Role } from '@/app/types';

// Mapping of who can add whom
const HIERARCHY_RULES: Record<Role, Role[]> = {
    "sr-dste": ["dste", "adste", "sse", "je", "technician"],
    "dste": ["adste", "sse", "je", "technician"],
    "adste": ["sse", "je", "technician"],
    "sse": ["je", "technician"],
    "je": ["technician"],
    "technician": []
};

const ROLE_LABELS: Record<Role, string> = {
    "sr-dste": "Sr. DSTE",
    "dste": "DSTE",
    "adste": "ADSTE",
    "sse": "SSE",
    "je": "JE",
    "technician": "Technician"
};

export default function HierarchyPage() {
    const { currentUser, users, addUser } = useGlobal();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPass, setNewPass] = useState("");
    const [newPf, setNewPf] = useState("");
    const [newRole, setNewRole] = useState<Role | "">("");

    if (!currentUser) return <div>Please login...</div>;

    const subordinates = users.filter(u => u.superiorId === currentUser.id);
    const superior = users.find(u => u.id === currentUser.superiorId);

    const allowedSubRoles = HIERARCHY_RULES[currentUser.role] || [];
    const canAddUser = allowedSubRoles.length > 0;

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRole) return;

        addUser({
            name: newName,
            phone: newPhone,
            email: newEmail,
            pass: newPass,
            pfNumber: newPf,
            role: newRole,
            sub: ROLE_LABELS[newRole],
            superiorId: currentUser.id
        });

        setIsModalOpen(false);
        setNewName(""); setNewPhone(""); setNewEmail(""); setNewPass(""); setNewPf("");
        alert("User added successfully!");
    };

    // Recursive component for tree view
    const TeamNode = ({ user, depth = 0 }: { user: User, depth?: number }) => {
        const directReports = users.filter(u => u.superiorId === user.id);
        const [expanded, setExpanded] = useState(false);

        return (
            <div className="team-node" style={{ marginLeft: depth > 0 ? '20px' : '0' }}>
                <div className="team-item" onClick={() => setExpanded(!expanded)} style={{ cursor: directReports.length ? 'pointer' : 'default' }}>
                    {directReports.length > 0 && (
                        <span className="collapse-icon" style={{ transform: expanded ? 'rotate(90deg)' : 'none', marginRight: '8px' }}>▶</span>
                    )}
                    <div className="item-avatar" style={{ background: '#e2e8f0', color: '#1e293b' }}>
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="item-content">
                        <div className="item-name">{user.name}</div>
                        <div className="item-role">{user.email}</div>
                    </div>
                    <div className="item-badge">{ROLE_LABELS[user.role]}</div>
                </div>

                {expanded && directReports.length > 0 && (
                    <div className="sub-team-list" style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '12px', paddingLeft: '12px' }}>
                        {directReports.map(sub => <TeamNode key={sub.id} user={sub} depth={depth + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>Team Structure</div>
                    {canAddUser && (
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            + Add {allowedSubRoles.map(r => ROLE_LABELS[r]).join('/')}
                        </button>
                    )}
                </div>

                <div className="team-list-container">
                    {/* Reporting Officer */}
                    {superior && (
                        <>
                            <div className="team-section-header">Reporting Officer (Superior)</div>
                            <div className="team-item" style={{ opacity: 0.8 }}>
                                <div className="item-avatar" style={{ background: '#cbd5e1' }}>{superior.name.substring(0, 2).toUpperCase()}</div>
                                <div className="item-content">
                                    <div className="item-name">{superior.name}</div>
                                    <div className="item-role">My Superior</div>
                                </div>
                                <div className="item-badge superior">{ROLE_LABELS[superior.role]}</div>
                            </div>
                        </>
                    )}

                    <div className="team-section-header" style={{ marginTop: '24px' }}>My Team (Me & Subordinates)</div>

                    {/* Me - Root of my tree */}
                    <TeamNode user={currentUser} />

                </div>
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90s%', padding: '24px' }}>
                        <h3>Add New Team Member</h3>
                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Role</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value as Role)} required>
                                    <option value="">Select Role...</option>
                                    {allowedSubRoles.map(r => (
                                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>PF Number</label>
                                <input type="text" value={newPf} onChange={e => setNewPf(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Phone (Login ID)</label>
                                <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create User</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
