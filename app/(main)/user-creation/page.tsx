"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/app/context/GlobalContext';
import { Role } from '@/app/types';

export default function UserCreationPage() {
    const router = useRouter();
    const { currentUser, users, addUser } = useGlobal();

    const [role, setRole] = useState<Role>("technician");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [pass, setPass] = useState("");
    const [pf, setPf] = useState("");
    const [superiorId, setSuperiorId] = useState("");

    // Allowed roles based on current user
    const allowedRoles = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'sr-dste') return ['dste', 'adste', 'sse', 'je', 'technician'];
        if (currentUser.role === 'dste') return ['adste', 'sse', 'je', 'technician'];
        if (currentUser.role === 'adste') return ['sse', 'je', 'technician'];
        return [];
    }, [currentUser]);

    // Potential Superiors (Users in the system)
    const potentialSuperiors = useMemo(() => {
        // Typically a JE reports to SSE, SSE to ADSTE, ADSTE to DSTE, DSTE to Sr. DSTE.
        // We filter based on the target role.
        if (role === 'dste') return users.filter(u => u.role === 'sr-dste');
        if (role === 'adste') return users.filter(u => u.role === 'dste');
        if (role === 'sse') return users.filter(u => u.role === 'adste');
        if (role === 'je' || role === 'technician') return users.filter(u => u.role === 'sse');
        return [];
    }, [role, users]);

    const handleCreate = () => {
        if (!name || !phone || !pass || !pf || !superiorId) {
            alert("Please fill all fields including Supervisor assignment.");
            return;
        }

        const superior = users.find(u => u.id === superiorId);

        addUser({
            name, phone, pass, role, pfNumber: pf,
            sub: role.toUpperCase(),
            email: `${name.toLowerCase().replace(' ', '.')}@railnet.gov.in`,
            superiorId,
            teamId: superior?.teamId
        });

        alert(`User ${name} created and assigned to ${superior?.name}`);
        setName(""); setPhone(""); setPass(""); setPf(""); setSuperiorId("");
    };

    if (allowedRoles.length === 0) return <div className="alert alert-warning">Unauthorized</div>;

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="section-title">User Management & Hierarchy Assignment</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="input-group">
                        <label>Full Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Entry name" />
                    </div>
                    <div className="input-group">
                        <label>Phone *</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Password *</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>PF Number *</label>
                        <input type="text" value={pf} onChange={e => setPf(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Target Role *</label>
                        <select value={role} onChange={e => { setRole(e.target.value as Role); setSuperiorId(""); }}>
                            {allowedRoles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Assign to Superior *</label>
                        <select value={superiorId} onChange={e => setSuperiorId(e.target.value)}>
                            <option value="">-- Select Boss --</option>
                            {potentialSuperiors.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreate}>CREATE & ASSIGN USER</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
