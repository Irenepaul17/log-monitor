import mongoose, { Schema, Model } from "mongoose";
import { WorkReport } from "@/app/types";

const WorkReportSchema = new Schema<WorkReport>(
    {
        date: { type: Date, required: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        sseSection: { type: String, required: true },
        station: { type: String, required: true },
        shift: { type: String, required: true },
        classification: { type: String, required: true },
        details: { type: Schema.Types.Mixed, required: true }, // Flexible schema for nested form answers
        attachments: { type: [String], default: [] },
    },
    {
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                // Format Date back to string for frontend if needed, though toJSON usually handles it
                if (ret.date instanceof Date) {
                    ret.date = ret.date.toISOString().split('T')[0];
                }
                // Ensure details is an object if it was stored otherwise (fallback)
                if (typeof ret.details === 'string') {
                    try { ret.details = JSON.parse(ret.details); } catch (e) { }
                }
            }
        },
        timestamps: true
    }
);

// Compound index for performance
WorkReportSchema.index({ authorId: 1, date: -1 });

// Force model refresh for schema updates in development
if (process.env.NODE_ENV === "development") {
    delete (mongoose.models as any).WorkReport;
}

const WorkReportModel: Model<WorkReport> = mongoose.models.WorkReport || mongoose.model<WorkReport>("WorkReport", WorkReportSchema);

export default WorkReportModel;
