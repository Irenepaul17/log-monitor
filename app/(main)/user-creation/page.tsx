"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useGlobal } from "@/app/context/GlobalContext";
import { Role } from "@/app/types";

/* ─── Role helpers ─── */
const ROLE_ORDER: Role[] = ["admin", "sr-dste", "dste", "adste", "sse", "je", "technician"];

const ROLE_LABEL: Record<Role, string> = {
    admin: "Admin",
    "sr-dste": "Sr. DSTE",
    dste: "DSTE",
    adste: "ADSTE",
    sse: "SSE",
    je: "JE",
    technician: "Technician",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    admin: { bg: "#7c3aed", color: "white" },
    "sr-dste": { bg: "#1e40af", color: "white" },
    dste: { bg: "#1d4ed8", color: "white" },
    adste: { bg: "#0369a1", color: "white" },
    sse: { bg: "#047857", color: "white" },
    je: { bg: "#b45309", color: "white" },
    technician: { bg: "#6b7280", color: "white" },
};

function RoleBadge({ role }: { role: string }) {
    const c = ROLE_COLORS[role] ?? { bg: "#94a3b8", color: "white" };
    return (
        <span style={{
            background: c.bg, color: c.color,
            padding: "2px 9px", borderRadius: 4,
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            whiteSpace: "nowrap",
        }}>
            {ROLE_LABEL[role as Role] ?? role}
        </span>
    );
}

/* ─── Default sub-designations per role ─── */
const DEFAULT_SUB: Record<Role, string> = {
    admin: "System Admin",
    "sr-dste": "Sr. DSTE",
    dste: "DSTE",
    adste: "ADSTE",
    sse: "SSE",
    je: "JE",
    technician: "Technician",
};

/* ─── Empty form state ─── */
const emptyForm = () => ({
    name: "",
    phone: "",
    pass: "",
    pfNumber: "",
    email: "",
    role: "technician" as Role,
    sub: DEFAULT_SUB["technician"],
    division: "",
    superiorId: "",
});

/* ═══════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════ */
export default function UserManagementPage() {
    const { currentUser, users, addUser } = useGlobal();

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    /* ─── Password reset modal (admin only) ─── */
    const [pwModal, setPwModal] = useState<{ userId: string; userName: string } | null>(null);
    const [newPass, setNewPass] = useState("");
    const [savingPass, setSavingPass] = useState(false);

    /* ─── Fetch all users ─── */
    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/user/all");
            if (res.ok) setAllUsers(await res.json());
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    /* ─── Role access control ─── */
    const allowedRoles = useMemo<Role[]>(() => {
        if (!currentUser) return [];
        const idx = ROLE_ORDER.indexOf(currentUser.role);
        if (idx < 0 || idx >= 3) return []; // sse/je/technician can't create
        return ROLE_ORDER.slice(idx + 1) as Role[];
    }, [currentUser]);

    const canManage = allowedRoles.length > 0;

    /* ─── Potential superiors for selected role ─── */
    const potentialSuperiors = useMemo(() => {
        const superiorRoleMap: Partial<Record<Role, Role>> = {
            "sr-dste": "admin",
            dste: "sr-dste",
            adste: "dste",
            sse: "adste",
            je: "sse",
            technician: "sse",
        };
        const targetRole = superiorRoleMap[form.role as Role];
        if (!targetRole) return [];
        return allUsers.filter(u => u.role === targetRole);
    }, [form.role, allUsers]);

    /* ─── Filtered users table ─── */
    const filteredUsers = useMemo(() => {
        if (!search.trim()) return allUsers;
        const q = search.toLowerCase();
        return allUsers.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q) ||
            u.phone?.includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.pfNumber?.toLowerCase().includes(q)
        );
    }, [allUsers, search]);

    /* ─── Form helpers ─── */
    const setField = (key: string, value: string) =>
        setForm(f => ({ ...f, [key]: value }));

    const handleRoleChange = (role: Role) => {
        setForm(f => ({
            ...f,
            role,
            sub: DEFAULT_SUB[role],
            superiorId: "",
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.phone || !form.pass || !form.pfNumber || !form.email || !form.division) {
            setFeedback({ type: "error", msg: "Please fill in all required fields." });
            return;
        }
        if (potentialSuperiors.length > 0 && !form.superiorId) {
            setFeedback({ type: "error", msg: "Please assign a superior for this role." });
            return;
        }

        setSaving(true);
        setFeedback(null);

        try {
            await addUser({
                name: form.name,
                phone: form.phone,
                pass: form.pass,
                pfNumber: form.pfNumber,
                email: form.email,
                role: form.role,
                sub: form.sub,
                division: form.division,
                superiorId: form.superiorId || undefined,
                teamId: allUsers.find(u => u.id === form.superiorId)?.teamId,
            });

            setFeedback({ type: "success", msg: `User "${form.name}" created successfully.` });
            setForm(emptyForm());
            setShowForm(false);
            await loadUsers();
        } catch (err: any) {
            setFeedback({ type: "error", msg: err.message || "Failed to create user." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Delete "${userName}"? This cannot be undone.`)) return;
        setDeletingId(userId);
        try {
            const res = await fetch(`/api/user/${userId}`, { method: "DELETE" });
            if (res.ok) {
                setAllUsers(prev => prev.filter(u => u.id !== userId));
                setFeedback({ type: "success", msg: `"${userName}" deleted.` });
            } else {
                const d = await res.json();
                setFeedback({ type: "error", msg: d.error || "Failed to delete user." });
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleResetPassword = async () => {
        if (!pwModal || !newPass.trim()) return;
        setSavingPass(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: pwModal.userId, updates: { pass: newPass.trim() } }),
            });
            if (res.ok) {
                setFeedback({ type: "success", msg: `Password updated for "${pwModal.userName}".` });
                setPwModal(null);
                setNewPass("");
            } else {
                const d = await res.json();
                setFeedback({ type: "error", msg: d.error || "Failed to update password." });
            }
        } finally {
            setSavingPass(false);
        }
    };

    if (!currentUser) return null;

    /* ─── Access denied ─── */
    if (!canManage) {
        return (
            <div style={{ padding: "60px 40px", textAlign: "center" }}>
                <div style={{
                    display: "inline-block", padding: "24px 32px",
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "12px", color: "#b91c1c",
                    fontWeight: 600, fontSize: "15px",
                }}>
                    🔒 You don&apos;t have permission to manage users.
                </div>
            </div>
        );
    }

    /* ─── Render ─── */
    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* Feedback banner */}
            {feedback && (
                <div style={{
                    marginBottom: 20, padding: "12px 18px",
                    borderRadius: 8, fontSize: 14, fontWeight: 500,
                    background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                    color: feedback.type === "success" ? "#15803d" : "#b91c1c",
                    border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <span>{feedback.type === "success" ? "✓ " : "✕ "}{feedback.msg}</span>
                    <button onClick={() => setFeedback(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: 0.5 }}>×</button>
                </div>
            )}

            {/* ── User list card ── */}
            <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                            User Management
                        </h2>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                            {allUsers.length} user{allUsers.length !== 1 ? "s" : ""} in the system
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setShowForm(f => !f); setFeedback(null); }}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px" }}
                    >
                        {showForm ? "✕ Cancel" : "+ Add User"}
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: "16px" }}>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, role, phone, email, PF…"
                        style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "9px 14px", borderRadius: "8px",
                            border: "1px solid #e2e8f0", fontSize: "14px",
                            outline: "none",
                        }}
                    />
                </div>

                {/* Table */}
                <div className="table-container">
                    {loadingUsers ? (
                        <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Loading users…</div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <table style={{ width: "100%" }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Designation</th>
                                        <th>Phone</th>
                                        <th>PF No.</th>
                                        <th>Division</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                                {search ? "No users match your search." : "No users found."}
                                            </td>
                                        </tr>
                                    ) : filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 600, color: "#0f172a" }}>{u.name}</td>
                                            <td><RoleBadge role={u.role} /></td>
                                            <td style={{ color: "#64748b", fontSize: "13px" }}>{u.sub}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{u.phone}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{u.pfNumber}</td>
                                            <td style={{ fontSize: "13px" }}>{u.division || "—"}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                    {currentUser.role === "admin" && (
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            style={{ borderColor: "#0369a1", color: "#0369a1", padding: "4px 12px", fontSize: "12px" }}
                                                            title="Reset password"
                                                            onClick={() => { setPwModal({ userId: u.id, userName: u.name }); setNewPass(""); }}
                                                        >
                                                            🔑 Password
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        style={{ borderColor: "#ef4444", color: "#ef4444", padding: "4px 12px", fontSize: "12px" }}
                                                        disabled={deletingId === u.id || u.role === "admin"}
                                                        title={u.role === "admin" ? "Cannot delete admin" : "Delete user"}
                                                        onClick={() => handleDelete(u.id, u.name)}
                                                    >
                                                        {deletingId === u.id ? "…" : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile cards */}
                            <div className="mobile-card-table">
                                {filteredUsers.length === 0 ? (
                                    <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                        {search ? "No users match your search." : "No users found."}
                                    </div>
                                ) : filteredUsers.map(u => (
                                    <div key={u.id} className="m-row">
                                        <div className="m-row-header">
                                            <span className="m-row-title">{u.name}</span>
                                            <RoleBadge role={u.role} />
                                        </div>
                                        <div className="m-row-meta">
                                            <span className="m-row-field">
                                                <span className="m-row-label">Phone</span>
                                                <span className="m-row-value" style={{ fontFamily: "monospace" }}>{u.phone}</span>
                                            </span>
                                            <span className="m-row-field">
                                                <span className="m-row-label">PF No.</span>
                                                <span className="m-row-value">{u.pfNumber}</span>
                                            </span>
                                            <span className="m-row-field">
                                                <span className="m-row-label">Division</span>
                                                <span className="m-row-value">{u.division || "—"}</span>
                                            </span>
                                        </div>
                                        <div className="m-row-actions">
                                            {currentUser.role === "admin" && (
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    style={{ borderColor: "#0369a1", color: "#0369a1" }}
                                                    onClick={() => { setPwModal({ userId: u.id, userName: u.name }); setNewPass(""); }}
                                                >
                                                    🔑 Password
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-outline"
                                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                                disabled={deletingId === u.id || u.role === "admin"}
                                                onClick={() => handleDelete(u.id, u.name)}
                                            >
                                                {deletingId === u.id ? "…" : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Password Reset Modal (admin only) ── */}
            {pwModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "white", borderRadius: 12, padding: "32px",
                        width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                    }}>
                        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                            🔑 Reset Password
                        </h3>
                        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
                            Setting new password for: <strong>{pwModal.userName}</strong>
                        </p>
                        <input
                            type="password"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            placeholder="Enter new password"
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                            style={{
                                width: "100%", boxSizing: "border-box",
                                padding: "10px 14px", borderRadius: 8,
                                border: "1px solid #e2e8f0", fontSize: 14,
                                marginBottom: 16, outline: "none",
                            }}
                        />
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => { setPwModal(null); setNewPass(""); }}
                                disabled={savingPass}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleResetPassword}
                                disabled={savingPass || !newPass.trim()}
                            >
                                {savingPass ? "Saving…" : "Save Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create user form ── */}
            {showForm && (
                <div className="card" style={{ padding: "28px" }}>
                    <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                        Create New User
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "20px" }}>

                            {/* Name */}
                            <div className="input-group">
                                <label>Full Name *</label>
                                <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Rajan Kumar" />
                            </div>

                            {/* Phone */}
                            <div className="input-group">
                                <label>Phone (Login ID) *</label>
                                <input type="tel" value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="e.g. 9876543210" />
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label>Password *</label>
                                <input type="password" value={form.pass} onChange={e => setField("pass", e.target.value)} placeholder="Set a password" />
                            </div>

                            {/* PF Number */}
                            <div className="input-group">
                                <label>PF Number *</label>
                                <input type="text" value={form.pfNumber} onChange={e => setField("pfNumber", e.target.value)} placeholder="e.g. PF123456" />
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label>Email *</label>
                                <input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="e.g. name@railnet.gov.in" />
                            </div>

                            {/* Division */}
                            <div className="input-group">
                                <label>Division *</label>
                                <input type="text" value={form.division} onChange={e => setField("division", e.target.value)} placeholder="e.g. Mumbai Division" />
                            </div>

                            {/* Role */}
                            <div className="input-group">
                                <label>Role *</label>
                                <select value={form.role} onChange={e => handleRoleChange(e.target.value as Role)}>
                                    {allowedRoles.map(r => (
                                        <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Designation (sub) */}
                            <div className="input-group">
                                <label>Designation / Sub-Title *</label>
                                <input type="text" value={form.sub} onChange={e => setField("sub", e.target.value)} placeholder="e.g. SSE/Signal" />
                            </div>

                            {/* Superior */}
                            {potentialSuperiors.length > 0 && (
                                <div className="input-group">
                                    <label>Assign to Superior *</label>
                                    <select value={form.superiorId} onChange={e => setField("superiorId", e.target.value)}>
                                        <option value="">— Select Superior —</option>
                                        {potentialSuperiors.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({ROLE_LABEL[u.role as Role] ?? u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => { setShowForm(false); setForm(emptyForm()); setFeedback(null); }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ minWidth: "160px" }}
                            >
                                {saving ? "Creating…" : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
