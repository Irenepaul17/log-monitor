import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/app/models/User";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const division = searchParams.get("division");
        const teamId = searchParams.get("teamId");

        if (!division && !teamId) {
            return NextResponse.json({ error: "division or teamId is required" }, { status: 400 });
        }

        const query = division ? { division } : { teamId };
        const teamMembers = await UserModel.find(query);

        // Strict seniority sorting: Sr. DSTE > DSTE > ADSTE > SSE > JE > Technician
        const roleOrder: Record<string, number> = {
            'sr-dste': 1,
            'dste': 2,
            'adste': 3,
            'sse': 4,
            'je': 5,
            'technician': 6
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
