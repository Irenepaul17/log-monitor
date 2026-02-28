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

const ROLE_COLORS: Record<Role, { bg: string, text: string, border: string }> = {
    "sr-dste": { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
    "dste": { bg: "#fff7ed", text: "#9a3412", border: "#fdba74" },
    "adste": { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
    "sse": { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
    "je": { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd" },
    "technician": { bg: "#f8fafc", text: "#475569", border: "#cbd5e1" }
};

interface TreeNode extends User {
    children: TreeNode[];
}

function buildTree(users: User[]): TreeNode[] {
    const userMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    users.forEach(u => userMap.set(u.id, { ...u, children: [] }));

    users.forEach(u => {
        const node = userMap.get(u.id)!;
        if (u.superiorId && userMap.has(u.superiorId)) {
            userMap.get(u.superiorId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    const roleOrder: Record<string, number> = {
        'sr-dste': 1, 'dste': 2, 'adste': 3, 'sse': 4, 'je': 5, 'technician': 6
    };
    const sortByRole = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));
        nodes.forEach(n => sortByRole(n.children));
    };
    sortByRole(roots);
    return roots;
}

interface UserCardProps {
    user: TreeNode;
    currentUserId: string;
    depth: number;
}

function UserCard({ user, currentUserId, depth }: UserCardProps) {
    const [collapsed, setCollapsed] = useState(false);
    const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.technician;
    const isSelf = user.id === currentUserId;
    const hasChildren = user.children.length > 0;
    const indentPx = depth * 28;

    return (
        <div>
            {/* Row */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '11px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: isSelf ? '#f0f9ff' : 'white',
                    transition: 'background 0.15s',
                    cursor: hasChildren ? 'pointer' : 'default',
                    position: 'relative',
                }}
                onClick={() => hasChildren && setCollapsed(c => !c)}
            >
                {/* Vertical connector line */}
                {depth > 0 && (
                    <div style={{
                        position: 'absolute',
                        left: `${20 + (depth - 1) * 28 + 18}px`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: '#e2e8f0',
                        zIndex: 0
                    }} />
                )}
                {/* Horizontal connector line */}
                {depth > 0 && (
                    <div style={{
                        position: 'absolute',
                        left: `${20 + (depth - 1) * 28 + 18}px`,
                        top: '50%',
                        width: '10px',
                        height: '1px',
                        background: '#e2e8f0',
                        zIndex: 0
                    }} />
                )}

                {/* Left: Member info (indented) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    paddingLeft: `${indentPx}px`,
                    zIndex: 1,
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: roleStyle.bg, color: roleStyle.text,
                        border: `1px solid ${roleStyle.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px', flexShrink: 0, marginRight: '12px'
                    }}>
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Name + badges */}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                                {user.name}
                            </span>
                            {isSelf && (
                                <span style={{
                                    fontSize: '10px', padding: '2px 6px', background: '#e0f2fe',
                                    color: '#0369a1', borderRadius: '4px', fontWeight: 800
                                }}>YOU</span>
                            )}
                            <span style={{
                                padding: '2px 8px', borderRadius: '5px', fontSize: '10px',
                                fontWeight: 700, background: roleStyle.bg, color: roleStyle.text,
                                border: `1px solid ${roleStyle.border}`
                            }}>
                                {ROLE_LABELS[user.role].toUpperCase()}
                            </span>
                            {hasChildren && (
                                <span style={{
                                    fontSize: '11px', color: '#94a3b8', background: '#f1f5f9',
                                    borderRadius: '4px', padding: '1px 6px'
                                }}>
                                    {collapsed ? '▶' : '▼'} {user.children.length} report{user.children.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div style={{
                            fontSize: '12px', color: '#64748b', marginTop: '2px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                            {user.email}
                        </div>
                    </div>
                </div>

                {/* PF Number – fixed width, always aligned with header */}
                <div style={{ width: '130px', flexShrink: 0, fontSize: '13px', color: '#475569', fontWeight: 500, zIndex: 1 }}>
                    {user.pfNumber}
                </div>

                {/* Contact – fixed width, always aligned with header */}
                <div style={{ width: '130px', flexShrink: 0, fontSize: '13px', color: '#64748b', zIndex: 1 }}>
                    {user.phone}
                </div>
            </div>

            {/* Children */}
            {!collapsed && user.children.map(child => (
                <UserCard key={child.id} user={child} currentUserId={currentUserId} depth={depth + 1} />
            ))}
        </div>
    );
}

export default function HierarchyPage() {
    const { currentUser, users } = useGlobal();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!currentUser) return <div style={{ padding: '40px', textAlign: 'center' }}>Please login...</div>;

    const canAddUser = currentUser.role === 'sse';
    const roots = buildTree(users);

    return (
        <div className="screen active" style={{ display: 'block', padding: '24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Team Directory</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                            {currentUser.division} Section • {users.length} total members • Chain of Command view
                        </p>
                    </div>
                    {canAddUser && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                            style={{ background: '#1e293b', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}
                        >
                            + Add Team Member
                        </button>
                    )}
                </div>

                <div className="card" style={{
                    padding: 0, borderRadius: '12px', overflow: 'hidden',
                    border: '1px solid #e2e8f0', background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        padding: '11px 20px', background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '11px', fontWeight: 700, color: '#64748b',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                        <div style={{ flex: 1 }}>Member &amp; Role</div>
                        <div style={{ width: '130px', flexShrink: 0 }}>PF Number</div>
                        <div style={{ width: '130px', flexShrink: 0 }}>Contact</div>
                    </div>

                    {roots.length > 0 ? (
                        roots.map(root => (
                            <UserCard key={root.id} user={root} currentUserId={currentUser.id} depth={0} />
                        ))
                    ) : (
                        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            No team members found in this section.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <AddUserModal onClose={() => setIsModalOpen(false)} currentUser={currentUser} />
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
        <div style={{
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
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                        <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="text" placeholder="e.g. Rohit Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                            <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} required>
                                <option value="">Select...</option>
                                {allowedRoles.map(r => (
                                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>PF Number</label>
                            <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="text" placeholder="PFXXXXXX" value={form.pfNumber} onChange={e => setForm({ ...form, pfNumber: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number (ID)</label>
                        <input style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} type="text" placeholder="10-digit mobile" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                    <div>
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
