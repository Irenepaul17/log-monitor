import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/app/models/User";

export async function PATCH(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { userId, updates } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Filter updates to allow only specific fields
        const allowedUpdates = ["name", "email", "phone", "pfNumber", "pass"];

        const filteredUpdates: any = {};

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
    }
}
