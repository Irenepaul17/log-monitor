import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ComplaintModel from '@/app/models/Complaint';
import UserModel from '@/app/models/User';

// Helper function to get all subordinate user IDs recursively
async function getAllSubordinateIds(userId: string): Promise<string[]> {
    const directSubordinates = await UserModel.find({ superiorId: userId });
    const subordinateIds = directSubordinates.map(u => u._id.toString());

    // Recursively get subordinates of subordinates
    for (const sub of directSubordinates) {
        const nestedIds = await getAllSubordinateIds(sub._id.toString());
        subordinateIds.push(...nestedIds);
    }

    return subordinateIds;
}

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');

        let query: any = {};

        // Apply role-based filtering
        if (role === 'sr-dste' || role === 'dste') {
            // Sr. DSTE and DSTE can see ALL complaints
            query = {};
        } else if (role === 'adste') {
            // ADSTE can see own complaints + all subordinates (SSE, JE, technician)
            if (userId) {
                const subordinateIds = await getAllSubordinateIds(userId);
                // Include own complaints + subordinate complaints
                query = { authorId: { $in: [userId, ...subordinateIds] } };
            }
        } else if (role === 'sse') {
            // SSE can see own complaints + JE complaints + technician complaints
            if (userId) {
                const subordinateIds = await getAllSubordinateIds(userId);
                // Include own complaints + subordinate complaints
                query = { authorId: { $in: [userId, ...subordinateIds] } };
            }
        } else if (role === 'je' || role === 'technician') {
            // JE and technician can only see their own complaints
            if (userId) {
                query = { authorId: userId };
            }
        }

        const complaints = await ComplaintModel.find(query).sort({ createdAt: -1 });
        return NextResponse.json(complaints);
    } catch (error) {
        console.error('Failed to fetch complaints:', error);
        return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const complaint = await ComplaintModel.create(body);
        return NextResponse.json(complaint, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
    }
}
