import mongoose, { Schema, Model } from "mongoose";
import { Complaint } from "@/app/types";

const ComplaintSchema = new Schema<Complaint>(
    {
        date: { type: String, required: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: ["Open", "Closed", "In Progress"],
            default: "Open"
        },
        supervisorId: { type: String },
        resolvedBy: { type: String },
        resolvedDate: { type: String },
        // Resolution fields (filled when complaint is resolved)
        rtTime: { type: String },
        actualFailureDetails: { type: String },
        trainDetention: { type: String },
        rectificationDetails: { type: String },
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

const ComplaintModel: Model<Complaint> = mongoose.models.Complaint || mongoose.model<Complaint>("Complaint", ComplaintSchema);

export default ComplaintModel;
