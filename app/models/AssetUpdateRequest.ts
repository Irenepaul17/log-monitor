import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssetUpdateRequest extends Document {
    assetId: string | null; // null if new asset
    assetType: 'signal' | 'point' | 'ei' | 'track-circuit';
    requestedBy: string;
    requestedByName: string;
    teamId: string;
    sseId?: string; // Target SSE ID for filtering
    proposedData: any;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    autoApproved: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AssetUpdateRequestSchema: Schema = new Schema({
    assetId: { type: Schema.Types.Mixed, default: null, index: true },
    assetType: { type: String, required: true, enum: ['signal', 'point', 'ei', 'track-circuit'] },
    requestedBy: { type: String, required: true },
    requestedByName: { type: String, required: true },
    teamId: { type: String, required: true },
    sseId: { type: String, index: true },
    proposedData: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comments: { type: String },
    autoApproved: { type: Boolean, default: false },
    reviewedBy: { type: String },
    reviewedAt: { type: Date }
}, {
    toJSON: {
        transform: function (doc, ret: any) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    timestamps: true
});

// Compound index for SSE dashboard performance
AssetUpdateRequestSchema.index({ sseId: 1, status: 1 });
AssetUpdateRequestSchema.index({ teamId: 1, status: 1 });

const AssetUpdateRequestModel: Model<IAssetUpdateRequest> =
    mongoose.models.AssetUpdateRequest || mongoose.model<IAssetUpdateRequest>('AssetUpdateRequest', AssetUpdateRequestSchema);

export default AssetUpdateRequestModel;
