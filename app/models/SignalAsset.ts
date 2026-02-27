import mongoose, { Schema, Document, Model } from 'mongoose';

// Sub-schema for equipment
const EquipmentSchema = new Schema({
    make: { type: String, default: "" },
    type: { type: String, default: "" },
    slNo: { type: String, default: "" },
    dom: { type: String, default: "" }, // Date of Manufacture
    doi: { type: String, default: "" }, // Date of Installation
    qty: { type: Schema.Types.Mixed, default: 0 }
}, { _id: false });

export interface ISignalAsset extends Document {
    // Basic Information
    sno: string;
    section: string;
    stationAutoSectionLcIbs: string;
    route: string;
    signalNoShuntNo: string;
    signalType: string;
    lhsRhs: string;
    smmsAssetCreated: string;
    assetApprovedByInChargeSSE: string;

    // Equipment Categories
    rg: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    hg: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    hhg: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    dg: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    shunt: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    routeEquipment: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    amarker: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };
    callingon: {
        make: string;
        type: string;
        slNo: string;
        dom: string;
        doi: string;
        qty: number | string;
    };

    // LED Details / Signal Configurations
    aspect2: string;
    aspect3: string;
    aspect4: string;
    shuntConfig: string;
    ind: string;
    onPost: string;
    co: string;
    routeConfig: string;
    home: string;
    starter: string;
    ib: string;
    gatesig: string;
    auto: string;
    retroReflectiveSignalNo: string;
}

const SignalAssetSchema: Schema = new Schema({
    // Basic Information
    sno: { type: String, default: "" },
    section: { type: String, required: true },
    stationAutoSectionLcIbs: { type: String, required: true },
    route: { type: String, default: "" },
    signalNoShuntNo: { type: String, required: true },
    signalType: { type: String, default: "" },
    lhsRhs: { type: String, default: "" },
    smmsAssetCreated: { type: String, default: "" },
    assetApprovedByInChargeSSE: { type: String, default: "" },

    // Equipment Categories
    rg: { type: EquipmentSchema, default: () => ({}) },
    hg: { type: EquipmentSchema, default: () => ({}) },
    hhg: { type: EquipmentSchema, default: () => ({}) },
    dg: { type: EquipmentSchema, default: () => ({}) },
    shunt: { type: EquipmentSchema, default: () => ({}) },
    routeEquipment: { type: EquipmentSchema, default: () => ({}) },
    amarker: { type: EquipmentSchema, default: () => ({}) },
    callingon: { type: EquipmentSchema, default: () => ({}) },

    // LED Details / Signal Configurations
    aspect2: { type: String, default: "" },
    aspect3: { type: String, default: "" },
    aspect4: { type: String, default: "" },
    shuntConfig: { type: String, default: "" },
    ind: { type: String, default: "" },
    onPost: { type: String, default: "" },
    co: { type: String, default: "" },
    routeConfig: { type: String, default: "" },
    home: { type: String, default: "" },
    starter: { type: String, default: "" },
    ib: { type: String, default: "" },
    gatesig: { type: String, default: "" },
    auto: { type: String, default: "" },
    retroReflectiveSignalNo: { type: String, default: "" }
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

const SignalAssetModel: Model<ISignalAsset> =
    mongoose.models.SignalAsset || mongoose.model<ISignalAsset>('SignalAsset', SignalAssetSchema);

export default SignalAssetModel;
