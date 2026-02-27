import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPointAsset extends Document {
    sseSection: string;
    station: string;
    pointNo: string;
    lineType: "Main Line" | "LoopLine";
    atKm: string;
    locationNumber: string;

    layout: string;
    throw: "143MM" | "220MM";
    endType: "Single End" | "Double End";
    pointMachineSlNo: string;
    yearOfManufacture: string;
    make: string;
    installedDate: string;

    motorSlNo: string;
    motorType: "IP67" | "NORMAL";
    motorMake: string;

    facingPoint: "Yes" | "No";
    antiTheftNut: "Yes" | "No";
    antiTheftNutStatus: "Full Set" | "Partial" | "Not provided";
    dateInstallAntiTheftFasteners: string;

    pBracketProtection: "Yes" | "No";
    dateInstallPBracketProtection: string;
    lostMotionStretcherBarProtection: "Yes" | "No";
    dateInstallLostMotionProtection: string;

    lastDatePointInsulationReplaced: string;
    duePointInsulationReplacement: string;
    ssdInsulation: "Claw" | "T type" | "N/A";

    michuangWaterLogging: "Yes" | "No";
    fullySubmergedHeavyRain: "Yes" | "No";

    galvanizedGroundConnections: "Yes" | "No";
    dateProvisionGalvanizedRoddings: string;
    fyProvisionGalvanizedRoddings: string;

    msFlatTieBarDetails: "Yes" | "No";
    ercMkIIIReplacement: "Yes" | "No";
    insulatingLinerReplacement: "Yes" | "No";

    circuit: string;
    noOfQBCARelays: number | string; // Allow string if user inputs weird data
    pointGroupParallelingDone: "Yes" | "No";

    wcrABDateManufacture: string;
    wcrABDateTested: string;
    wczr1DateManufacture: string;
    wczr1DateTested: string;
    nwczrDateManufacture: string;
    nwczrDateTested: string;
    rwczrDateManufacture: string;
    rwczrDateTested: string;
}

const PointAssetSchema: Schema = new Schema({
    sseSection: { type: String, required: true },
    station: { type: String, required: true },
    pointNo: { type: String, required: true },
    lineType: { type: String, required: true },
    atKm: { type: String, default: "" },
    locationNumber: { type: String, default: "" },

    layout: { type: String, default: "" },
    throw: { type: String, default: "" },
    endType: { type: String, default: "" },
    pointMachineSlNo: { type: String, default: "" },
    yearOfManufacture: { type: String, default: "" },
    make: { type: String, default: "" },
    installedDate: { type: String, default: "" },

    motorSlNo: { type: String, default: "" },
    motorType: { type: String, default: "" },
    motorMake: { type: String, default: "" },

    facingPoint: { type: String, default: "No" },
    antiTheftNut: { type: String, default: "No" },
    antiTheftNutStatus: { type: String, default: "Not provided" },
    dateInstallAntiTheftFasteners: { type: String, default: "" },

    pBracketProtection: { type: String, default: "No" },
    dateInstallPBracketProtection: { type: String, default: "" },
    lostMotionStretcherBarProtection: { type: String, default: "No" },
    dateInstallLostMotionProtection: { type: String, default: "" },

    lastDatePointInsulationReplaced: { type: String, default: "" },
    duePointInsulationReplacement: { type: String, default: "" },
    ssdInsulation: { type: String, default: "N/A" },

    michuangWaterLogging: { type: String, default: "No" },
    fullySubmergedHeavyRain: { type: String, default: "No" },

    galvanizedGroundConnections: { type: String, default: "No" },
    dateProvisionGalvanizedRoddings: { type: String, default: "" },
    fyProvisionGalvanizedRoddings: { type: String, default: "" },

    msFlatTieBarDetails: { type: String, default: "No" },
    ercMkIIIReplacement: { type: String, default: "No" },
    insulatingLinerReplacement: { type: String, default: "No" },

    circuit: { type: String, default: "" },
    noOfQBCARelays: { type: Schema.Types.Mixed, default: 0 },
    pointGroupParallelingDone: { type: String, default: "No" },

    wcrABDateManufacture: { type: String, default: "" },
    wcrABDateTested: { type: String, default: "" },
    wczr1DateManufacture: { type: String, default: "" },
    wczr1DateTested: { type: String, default: "" },
    nwczrDateManufacture: { type: String, default: "" },
    nwczrDateTested: { type: String, default: "" },
    rwczrDateManufacture: { type: String, default: "" },
    rwczrDateTested: { type: String, default: "" },
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

const PointAssetModel: Model<IPointAsset> = mongoose.models.PointAsset || mongoose.model<IPointAsset>('PointAsset', PointAssetSchema);

export default PointAssetModel;
