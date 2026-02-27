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
    division: string;
}

export interface WorkReport {
    id: string;
    date: Date | string;
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
    date: Date | string;
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

export interface AssetUpdateRequest {
    id: string;
    assetId: string | null;
    assetType: string;
    requestedBy: string;
    requestedByName: string;
    teamId: string;
    proposedData: any;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    createdAt: string;
}
