import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/app/models/User";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get("teamId");

        if (!teamId) {
            return NextResponse.json({ error: "teamId is required" }, { status: 400 });
        }

        const teamMembers = await UserModel.find({ teamId });

        // Sort by role priority: SSE > JE > Technician > others
        const roleOrder: Record<string, number> = {
            'sse': 1,
            'je': 2,
            'technician': 3,
            'adste': 4,
            'dste': 5,
            'sr-dste': 6
        };

        teamMembers.sort((a, b) => {
            const orderA = roleOrder[a.role] || 99;
            const orderB = roleOrder[b.role] || 99;
            return orderA - orderB;
        });

        return NextResponse.json(teamMembers);
    } catch (error: any) {
        console.error("Error fetching team members:", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}
