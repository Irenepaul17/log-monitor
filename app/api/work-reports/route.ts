import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkReportModel from '@/app/models/WorkReport';
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
            // Sr. DSTE and DSTE can see ALL reports
            query = {};
        } else if (role === 'adste') {
            // ADSTE can see own reports + all subordinates (SSE, JE, technician)
            if (userId) {
                const subordinateIds = await getAllSubordinateIds(userId);
                // Include own reports + subordinate reports
                query = { authorId: { $in: [userId, ...subordinateIds] } };
            }
        } else if (role === 'sse') {
            // SSE can see own reports + JE reports + technician reports
            if (userId) {
                const subordinateIds = await getAllSubordinateIds(userId);
                // Include own reports + subordinate reports
                query = { authorId: { $in: [userId, ...subordinateIds] } };
            }
        } else if (role === 'je' || role === 'technician') {
            // JE and technician can only see their own reports
            if (userId) {
                query = { authorId: userId };
            }
        }

        const reports = await WorkReportModel.find(query).sort({ createdAt: -1 });
        return NextResponse.json(reports);
    } catch (error) {
        console.error('Failed to fetch reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        console.log('Received work report data:', JSON.stringify(body, null, 2));
        const report = await WorkReportModel.create(body);
        console.log('Successfully created report:', report._id);
        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        console.error('Failed to create report:', error);
        return NextResponse.json({
            error: 'Failed to create report',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
