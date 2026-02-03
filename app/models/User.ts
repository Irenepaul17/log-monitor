import mongoose, { Schema, Model } from "mongoose";
import { User } from "@/app/types";

// Define the schema based on the User interface
const UserSchema = new Schema<User>(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        pass: { type: String, required: true },
        role: {
            type: String,
            required: true,
            enum: ["sr-dste", "dste", "adste", "sse", "je", "technician"]
        },
        sub: { type: String, required: true }, // Sub-designation e.g., "Sr. DSTE", "JE 1"
        email: { type: String, required: true },
        pfNumber: { type: String, required: true },
        superiorId: { type: String }, // Can be reference to another User's ID
        teamId: { type: String },
    },
    {
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            }
        },
        timestamps: true
    }
);

// Check if model is already defined (for hot reloading)
const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
