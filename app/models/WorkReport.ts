import mongoose, { Schema, Model } from "mongoose";
import { WorkReport } from "../context/GlobalContext";

const WorkReportSchema = new Schema<WorkReport>(
    {
        date: { type: String, required: true },
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
                // Ensure details is an object if it was stored otherwise (fallback)
                if (typeof ret.details === 'string') {
                    try { ret.details = JSON.parse(ret.details); } catch (e) { }
                }
            }
        },
        timestamps: true
    }
);

const WorkReportModel: Model<WorkReport> = mongoose.models.WorkReport || mongoose.model<WorkReport>("WorkReport", WorkReportSchema);

export default WorkReportModel;
