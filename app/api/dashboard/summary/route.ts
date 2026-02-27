import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkReportModel from "@/app/models/WorkReport";
import ComplaintModel from "@/app/models/Complaint";
import UserModel from "@/app/models/User";

// Helper function to get all subordinate user IDs recursively (matching api/work-reports)
async function getAllSubordinateIds(userId: string): Promise<string[]> {
    const directSubordinates = await UserModel.find({ superiorId: userId });
    const subordinateIds = directSubordinates.map(u => u._id.toString());

    for (const sub of directSubordinates) {
        const nestedIds = await getAllSubordinateIds(sub._id.toString());
        subordinateIds.push(...nestedIds);
    }

    return subordinateIds;
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const role = searchParams.get("role");

        if (!userId || !role) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let query: any = {};

        // Role-based filtering logic (aligned with /api/work-reports)
        if (role === 'sr-dste' || role === 'dste') {
            // No filter
        } else if (role === 'adste' || role === 'sse') {
            const subordinateIds = await getAllSubordinateIds(userId);
            query.authorId = { $in: [userId, ...subordinateIds] };
        } else if (role === 'je' || role === 'technician') {
            query.authorId = userId;
        }

        // 1. Total Counts
        const [totalWorkLogs, openFailures] = await Promise.all([
            WorkReportModel.countDocuments(query),
            ComplaintModel.countDocuments({ ...query, status: 'Open' })
        ]);

        // 2. Accurate Month-specific Aggregation
        const getMonthCounts = async (model: any, additionalQuery: any = {}) => {
            const aggregation = await model.aggregate([
                { $match: { ...query, ...additionalQuery } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);

            const countsMap: Record<string, number> = {};
            aggregation.forEach((item: any) => {
                const year = item._id.year;
                const month = item._id.month.toString().padStart(2, '0');
                countsMap[`${year}-${month}`] = item.count;
            });
            return countsMap;
        };

        const [workLogAggr, failureAggr] = await Promise.all([
            getMonthCounts(WorkReportModel),
            getMonthCounts(ComplaintModel, { status: 'Open' })
        ]);

        // 3. Pre-generate Last 12 Months to fill gaps
        const monthCounts = {
            workLogs: {} as Record<string, number>,
            failures: {} as Record<string, number>
        };

        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            monthCounts.workLogs[key] = workLogAggr[key] || 0;
            monthCounts.failures[key] = failureAggr[key] || 0;
        }

        return NextResponse.json({
            totals: {
                workLogs: totalWorkLogs,
                openFailures: openFailures
            },
            monthCounts
        });

    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
