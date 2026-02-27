import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrackCircuitAsset extends Document {
    sseSection: string;
    station: string;
    trackCircuitNo: string;
    type: string; // DC, AFTC, etc.
    make: string;
    length: string;
    dateOfInstallation: string;
    finacialYear: string;

    // Technical Details
    relayType: string;
    relayMake: string;
    batteryType: string;
    batteryQty: string;
    chargerType: string;

    // Status
    location: string;
    status: string;

    createdAt: Date;
    updatedAt: Date;
}

const TrackCircuitAssetSchema: Schema = new Schema({
    sseSection: { type: String, required: true },
    station: { type: String, required: true },
    trackCircuitNo: { type: String, required: true },
    type: { type: String, default: "" },
    make: { type: String, default: "" },
    length: { type: String, default: "" },
    dateOfInstallation: { type: String, default: "" },
    finacialYear: { type: String, default: "" },
    relayType: { type: String, default: "" },
    relayMake: { type: String, default: "" },
    batteryType: { type: String, default: "" },
    batteryQty: { type: String, default: "" },
    chargerType: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, default: "" }
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

const TrackCircuitAssetModel: Model<ITrackCircuitAsset> =
    mongoose.models.TrackCircuitAsset || mongoose.model<ITrackCircuitAsset>('TrackCircuitAsset', TrackCircuitAssetSchema);

export default TrackCircuitAssetModel;
