import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/app/models/User";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        const { phone, pass, name, role, sub, email, pfNumber } = body;
        if (!phone || !pass || !name || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check for existing user
        const existingUser = await UserModel.findOne({ phone });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const newUser = await UserModel.create({
            ...body
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
    }
}
