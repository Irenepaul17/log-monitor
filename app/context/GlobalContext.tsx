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
    createdAt?: string;
    updatedAt?: string;
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
    // Resolution fields
    rtTime?: string;
    actualFailureDetails?: string;
    trainDetention?: string;
    rectificationDetails?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface GlobalContextType {
    currentUser: User | null;
    users: User[];
    reports: WorkReport[];
    complaints: Complaint[];
    login: (phone: string, pass: string) => Promise<boolean>;
    logout: () => void;
    addUser: (user: Omit<User, "id">) => void;
    addReport: (report: Omit<WorkReport, "id">) => Promise<void>;
    addComplaint: (complaint: Omit<Complaint, "id" | "date" | "status">) => Promise<void>;
    resolveComplaint: (id: string, resolutionData: {
        rtTime: string;
        actualFailureDetails: string;
        trainDetention: string;
        rectificationDetails: string;
    }) => Promise<void>;
    isSuperiorOf: (superior: User, subordinate: User | string) => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [reports, setReports] = useState<WorkReport[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    // Restore session user if stored
    React.useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // Fetch data when user changes
    React.useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                const [repRes, compRes] = await Promise.all([
                    fetch(`/api/work-reports?userId=${currentUser.id}&role=${currentUser.role}`),
                    fetch(`/api/complaints?userId=${currentUser.id}&role=${currentUser.role}`)
                ]);
                if (repRes.ok) setReports(await repRes.json());
                if (compRes.ok) setComplaints(await compRes.json());
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };
        fetchData();
    }, [currentUser]);

    const login = async (phone: string, pass: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pass })
            });

            if (res.ok) {
                const user = await res.json();
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));

                // Redirect based on role
                const dashboardMap: Record<string, string> = {
                    'sr-dste': '/dashboard/sr-dste',
                    'dste': '/dashboard/dste',
                    'adste': '/dashboard/adste',
                    'sse': '/dashboard/sse',
                    'je': '/dashboard/je',
                    'technician': '/dashboard/je' // Technician goes to JE dashboard for now?
                };
                router.push(dashboardMap[user.role] || '/dashboard/je');
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    const addUser = (user: Omit<User, "id">) => {
        // Not implemented API yet
        console.warn("addUser not implemented with DB yet");
    };

    const addReport = async (report: Omit<WorkReport, "id">) => {
        try {
            const res = await fetch('/api/work-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
            if (res.ok) {
                const newReport: WorkReport = await res.json();
                setReports(prev => [newReport, ...prev]);
            }
        } catch (e) {
            console.error("Failed to add report", e);
        }
    };

    const addComplaint = async (complaint: Omit<Complaint, "id" | "date" | "status">) => {
        try {
            const newComplaintData = {
                ...complaint,
                date: new Date().toISOString().split('T')[0],
                status: "Open"
            };
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComplaintData)
            });
            if (res.ok) {
                const savedComplaint = await res.json();
                setComplaints(prev => [savedComplaint, ...prev]);
            }
        } catch (e) {
            console.error("Failed to add complaint", e);
        }
    };

    const resolveComplaint = async (id: string, resolutionData: {
        rtTime: string;
        actualFailureDetails: string;
        trainDetention: string;
        rectificationDetails: string;
    }) => {
        if (!currentUser) return;

        try {
            const res = await fetch(`/api/complaints/${id}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...resolutionData,
                    resolvedBy: currentUser.name,
                    resolvedDate: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                const updatedComplaint: Complaint = await res.json();
                setComplaints(prev => prev.map(c => c.id === id ? updatedComplaint : c));
            }
        } catch (e) {
            console.error("Failed to resolve complaint", e);
        }
    };

    const isSuperiorOf = (superior: User, subordinate: User | string): boolean => {
        // Simplified check without full users list
        const subId = typeof subordinate === 'string' ? subordinate : subordinate.id;
        return superior.id === subId;
    };

    return (
        <GlobalContext.Provider value={{
            currentUser,
            users,
            reports,
            complaints,
            login,
            logout,
            addUser,
            addReport,
            addComplaint,
            resolveComplaint,
            isSuperiorOf
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error("useGlobal must be used within a GlobalProvider");
    }
    return context;
}
