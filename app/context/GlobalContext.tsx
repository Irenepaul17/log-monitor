"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, WorkReport, Complaint, Role } from "@/app/types";

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
    updateProfile: (updates: Partial<User>) => Promise<boolean>;
    isSuperiorOf: (superior: User, subordinate: User | string) => boolean;
    refreshTeam: () => Promise<void>;
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
    const refreshTeam = async () => {
        if (!currentUser?.division && !currentUser?.teamId) return;
        try {
            const queryParam = currentUser.division ? `division=${currentUser.division}` : `teamId=${currentUser.teamId}`;
            const res = await fetch(`/api/user/team?${queryParam}`);
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch team", e);
        }
    };

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

                // Fetch team members
                await refreshTeam();
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

    const addUser = async (user: Omit<User, "id">) => {
        try {
            const res = await fetch('/api/auth/register', { // Assuming register exists or I should create it
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (res.ok) {
                await refreshTeam();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add user');
            }
        } catch (e: any) {
            console.error("Failed to add user", e);
            alert(e.message);
        }
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
            console.error("Failed to add failure", e);
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
            console.error("Failed to resolve failure", e);
        }
    };

    const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
        if (!currentUser) return false;

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, updates })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setCurrentUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                return true;
            }
            return false;
        } catch (e) {
            console.error("Failed to update profile", e);
            return false;
        }
    };

    const isSuperiorOf = (superior: User, subordinate: User | string): boolean => {
        const sub = typeof subordinate === 'string' ? users.find(u => u.id === subordinate) : subordinate;
        return sub?.superiorId === superior.id;
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
            updateProfile,
            isSuperiorOf,
            refreshTeam
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
