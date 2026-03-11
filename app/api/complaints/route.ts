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
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        const monthParam = searchParams.get('month'); // YYYY-MM

        let query: any = {};

        // Month Filtering Logic (Clinical Date Range)
        if (monthParam) {
            const [year, month] = monthParam.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            query.date = { $gte: start, $lt: end };
        }

        // Apply role-based filtering
        if (role === 'admin' || role === 'sr-dste' || role === 'dste') {
            // Admin, Sr. DSTE, and DSTE can see ALL complaints
        } else if (role === 'adste' || role === 'sse') {
            // ADSTE/SSE see own + all subordinates
            if (userId) {
                const subordinateIds = await getAllSubordinateIds(userId);
                query.authorId = { $in: [userId, ...subordinateIds] };
            }
        } else if (role === 'je' || role === 'technician') {
            // JE/tech see own only
            if (userId) {
                query.authorId = userId;
            }
        }

        // Pagination Logic
        if (pageParam && limitParam) {
            const page = parseInt(pageParam, 10) || 1;
            const limit = parseInt(limitParam, 10) || 10;
            const skip = (page - 1) * limit;

            const total = await ComplaintModel.countDocuments(query);
            const complaints = await ComplaintModel.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                data: complaints,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            });
        }

        // Legacy support
        const complaints = await ComplaintModel.find(query).sort({ date: -1 });
        return NextResponse.json(complaints);

    } catch (error: any) {
        console.error('❌ Failed to fetch complaints:', error);
        return NextResponse.json({
            error: 'Failed to fetch complaints',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
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
