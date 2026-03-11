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
            // Admin, Sr. DSTE, and DSTE can see ALL reports (optionally filtered by query)
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

            const total = await WorkReportModel.countDocuments(query);
            const reports = await WorkReportModel.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                data: reports,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            });
        }

        // Legacy: Return all (for GlobalContext backward compatibility)
        const reports = await WorkReportModel.find(query).sort({ date: -1 });
        return NextResponse.json(reports);

    } catch (error: any) {
        console.error('❌ Failed to fetch reports:', error);
        return NextResponse.json({
            error: 'Failed to fetch reports',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Date Validation
        if (body.date) {
            const reportDate = new Date(body.date);
            const today = new Date();
            const minDate = new Date('2024-01-01');

            if (reportDate > today || reportDate < minDate) {
                return NextResponse.json({
                    error: 'Invalid date. Date must be between 2024-01-01 and today.'
                }, { status: 400 });
            }
        }

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
