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
        const allowedUpdates = ["name", "email", "phone", "pfNumber", "pass", "role", "sub", "division", "superiorId"];

        const filteredUpdates: any = {};

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                // If superiorId is empty string, convert to unset or null
                if (field === "superiorId" && updates[field] === "") {
                    filteredUpdates[field] = null;
                } else {
                    filteredUpdates[field] = updates[field];
                }
            }
        });

        // Prevent modifying the role of the super admin to something else,
        // or ensure we don't accidentally demote the only admin.
        if (filteredUpdates.role && filteredUpdates.role !== "admin") {
            const userCheck = await UserModel.findById(userId);
            if (userCheck && userCheck.role === "admin") {
                return NextResponse.json({ error: "Cannot change the role of the Super Admin." }, { status: 400 });
            }
        }

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
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0];
            return NextResponse.json({ error: `A user with this ${field} already exists. No duplicates allowed.` }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
    }
}
