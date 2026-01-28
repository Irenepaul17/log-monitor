"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// --- Types ---

export type Role = "sr-dste" | "dste" | "adste" | "sse" | "je" | "technician";

export interface User {
    id: string;
    name: string;
    phone: string;
    pass: string;
    role: Role;
    sub: string;
    email: string;
    pfNumber: string;
    superiorId?: string;
    teamId?: string;
}

export interface WorkReport {
    id: string;
    date: string;
    authorId: string;
    authorName: string;
    sseSection: string;
    station: string;
    shift: string;
    classification: string;
    details: any;
    attachments?: string[];
}

export interface Complaint {
    id: string;
    date: string;
    authorId: string;
    authorName: string;
    category: string;
    description: string;
    status: "Open" | "Closed" | "In Progress";
    supervisorId?: string;
    resolvedBy?: string;
    resolvedDate?: string;
}

interface GlobalContextType {
    currentUser: User | null;
    users: User[];
    reports: WorkReport[];
    complaints: Complaint[];
    login: (phone: string, pass: string) => boolean;
    logout: () => void;
    addUser: (user: Omit<User, "id">) => void;
    addReport: (report: Omit<WorkReport, "id">) => void;
    addComplaint: (complaint: Omit<Complaint, "id" | "date" | "status">) => void;
    resolveComplaint: (id: string) => void;
    isSuperiorOf: (superior: User, subordinate: User | string) => boolean;
}

const DEFAULT_USERS: User[] = [
    { id: 'u1', name: 'Sr. DSTE (Admin)', phone: '1234567890', pass: 'admin123', role: 'sr-dste', sub: 'Sr. DSTE', email: 'sr.dste@railnet.gov.in', pfNumber: 'PF0001' },
    { id: 'u2', name: 'DSTE Rajesh', phone: '9000000001', pass: 'dste123', role: 'dste', sub: 'DSTE', superiorId: 'u1', email: 'dste.rajesh@railnet.gov.in', pfNumber: 'PF1001' },
    { id: 'u3', name: 'ADSTE 1 Sunita', phone: '9000000002', pass: 'adste123', role: 'adste', sub: 'ADSTE 1', superiorId: 'u2', teamId: '1', email: 'adste1@railnet.gov.in', pfNumber: 'PF2001' },
    { id: 'u4', name: 'SSE 1 Amit', phone: '9000000003', pass: 'sse123', role: 'sse', sub: 'SSE 1', superiorId: 'u3', teamId: '1', email: 'sse1@railnet.gov.in', pfNumber: 'PF3001' },
    { id: 'u5', name: 'JE 1 Deepak', phone: '9000000004', pass: 'je123', role: 'je', sub: 'JE 1', superiorId: 'u4', teamId: '1', email: 'je1@railnet.gov.in', pfNumber: 'PF4001' },
    { id: 'u6', name: 'Tech 1 Ramesh', phone: '9000000007', pass: 'tech123', role: 'technician', sub: 'Tech 1', superiorId: 'u5', teamId: '1', email: 'tech1@railnet.gov.in', pfNumber: 'PF5001' },
    { id: 'u7', name: 'ADSTE 2 Rajesh', phone: '9000000005', pass: 'adste123', role: 'adste', sub: 'ADSTE 2', superiorId: 'u2', teamId: '2', email: 'adste2@railnet.gov.in', pfNumber: 'PF2002' },
    { id: 'u8', name: 'SSE 2 Vikram', phone: '9000000008', pass: 'sse123', role: 'sse', sub: 'SSE 2', superiorId: 'u7', teamId: '2', email: 'sse2@railnet.gov.in', pfNumber: 'PF3002' },
    { id: 'u9', name: 'JE 2 Kavita', phone: '9000000006', pass: 'je123', role: 'je', sub: 'JE 2', superiorId: 'u8', teamId: '2', email: 'je2@railnet.gov.in', pfNumber: 'PF4002' },
    { id: 'u10', name: 'Tech 2 Suresh', phone: '9000000009', pass: 'tech123', role: 'technician', sub: 'Tech 2', superiorId: 'u9', teamId: '2', email: 'tech2@railnet.gov.in', pfNumber: 'PF5002' },
];

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
    const [reports, setReports] = useState<WorkReport[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    // Initialize users in localStorage if not present
    React.useEffect(() => {
        const savedUsers = localStorage.getItem('users');
        if (!savedUsers) {
            // First time - save DEFAULT_USERS to localStorage
            localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
        } else {
            // Load saved users from localStorage
            try {
                const loadedUsers = JSON.parse(savedUsers);
                setUsers(loadedUsers);
            } catch (e) {
                console.error('Failed to load users:', e);
                // Fallback to DEFAULT_USERS if parse fails
                localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
            }
        }
    }, []);

    // Load reports and complaints from localStorage on mount
    React.useEffect(() => {
        const savedReports = localStorage.getItem('workReports');
        const savedComplaints = localStorage.getItem('complaints');

        if (savedReports) {
            try {
                setReports(JSON.parse(savedReports));
            } catch (e) {
                console.error('Failed to load reports:', e);
            }
        }

        if (savedComplaints) {
            try {
                setComplaints(JSON.parse(savedComplaints));
            } catch (e) {
                console.error('Failed to load complaints:', e);
            }
        }
    }, []);

    // Save reports to localStorage whenever they change
    React.useEffect(() => {
        if (reports.length > 0) {
            localStorage.setItem('workReports', JSON.stringify(reports));
        }
    }, [reports]);

    // Save complaints to localStorage whenever they change
    React.useEffect(() => {
        if (complaints.length > 0) {
            localStorage.setItem('complaints', JSON.stringify(complaints));
        }
    }, [complaints]);

    const isSuperiorOf = (superior: User, subordinate: User | string): boolean => {
        // Sr. DSTE and DSTE see everything
        if (superior.role === 'sr-dste' || superior.role === 'dste') return true;

        // Get the subordinate user object
        const subObj = typeof subordinate === 'string' ? users.find(u => u.id === subordinate) : subordinate;
        if (!subObj) return false;

        // Direct report check
        if (subObj.superiorId === superior.id) return true;

        // Walk up the chain
        let currentId = subObj.superiorId;
        while (currentId) {
            if (currentId === superior.id) return true;
            const nextSuperior = users.find(u => u.id === currentId);
            currentId = nextSuperior?.superiorId;
        }

        return false;
    };

    const login = (phone: string, pass: string) => {
        const user = users.find(u => u.phone === phone && u.pass === pass);
        if (user) {
            setCurrentUser(user);
            const dashboardMap: Record<string, string> = {
                'sr-dste': '/dashboard/sr-dste',
                'dste': '/dashboard/dste',
                'adste': '/dashboard/adste',
                'sse': '/dashboard/sse',
                'je': '/dashboard/je',
                'technician': '/dashboard/je'
            };
            router.push(dashboardMap[user.role] || '/dashboard/je');
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        router.push("/");
    };

    const addUser = (userData: Omit<User, "id">) => {
        const newUser = { ...userData, id: `u${users.length + 1}` };
        setUsers(prev => [...prev, newUser]);
    };

    const addReport = (reportData: Omit<WorkReport, "id">) => {
        const newReport: WorkReport = {
            ...reportData,
            id: Date.now().toString()
        };
        setReports(prev => [newReport, ...prev]);

        // Auto-create complaint if failure status is "Yes & Booked"
        if (reportData.classification === 'Failure Attention' &&
            reportData.details?.failureStatus === 'Yes & Booked') {

            // Find the user's superior
            const author = users.find(u => u.id === reportData.authorId);
            const supervisorId = author?.superiorId;

            const newComplaint: Complaint = {
                id: `#C${String(complaints.length + 1).padStart(3, '0')}`,
                date: reportData.date,
                authorId: reportData.authorId,
                authorName: reportData.authorName,
                category: reportData.details?.failureAttentionOn || 'General Failure',
                description: reportData.details?.failureDetails || 'Failure reported',
                status: "Open",
                supervisorId: supervisorId
            };
            setComplaints(prev => [newComplaint, ...prev]);
        }
    };

    const addComplaint = (complaintData: Omit<Complaint, "id" | "date" | "status">) => {
        const newComplaint: Complaint = {
            ...complaintData,
            id: `#C${String(complaints.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            status: "Open"
        };
        setComplaints(prev => [newComplaint, ...prev]);
    };

    const resolveComplaint = (id: string) => {
        setComplaints(prev => prev.map(c =>
            c.id === id ? { ...c, status: "Closed", resolvedBy: currentUser?.name || "Admin", resolvedDate: new Date().toISOString().split('T')[0] } : c
        ));
    };

    return (
        <GlobalContext.Provider value={{
            currentUser, users, reports, complaints,
            login, logout, addUser, addReport, addComplaint, resolveComplaint, isSuperiorOf
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) throw new Error("useGlobal must be used within a GlobalProvider");
    return context;
}
