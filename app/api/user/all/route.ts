import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/app/models/User";

export async function GET() {
    try {
        await dbConnect();

        const allUsers = await UserModel.find({});

        // Strict seniority sorting: Admin > Sr. DSTE > DSTE > ADSTE > SSE > JE > Technician
        const roleOrder: Record<string, number> = {
            'admin': 0,
            'sr-dste': 1,
            'dste': 2,
            'adste': 3,
            'sse': 4,
            'je': 5,
            'technician': 6
        };

        allUsers.sort((a, b) => {
            const orderA = roleOrder[a.role] ?? 99;
            const orderB = roleOrder[b.role] ?? 99;
            return orderA - orderB;
        });

        return NextResponse.json(allUsers);
    } catch (error: any) {
        console.error("Error fetching all users:", error);
        return NextResponse.json({ error: "Failed to fetch all users" }, { status: 500 });
    }
}
