import mongoose, { Schema, Model } from "mongoose";
import { EIAsset } from "@/app/types/assets";

const EIAssetSchema = new Schema<EIAsset>(
    {
        serialNumber: { type: String },
        sseSection: { type: String, default: '' },
        station: { type: String, default: '' },
        stationAutoSection: { type: String, default: '' },
        section: { type: String, default: '' },
        route: { type: String, default: '' },
        make: { type: String, default: '' },
        numberOfRoutes: { type: String, default: '' },
        state: { type: String, default: '' },
        dateOfInstallation: { type: String, default: '' },
        financialYear: { type: String, default: '' },

        centralisedDistributed: { type: String, default: '' },
        numberOfOCs: { type: String, default: '' },
        rdsoTypicalCircuit: { type: String, default: '' },
        powerCableRedundancy: { type: String, default: '' },
        tdcRedundantPowerCable: { type: String, default: '' },
        systemType: { type: String, default: '' },

        vdu1MakeModel: { type: String, default: '' },
        vdu1ManufactureDate: { type: String, default: '' },
        vdu1LastReplacementDate: { type: String, default: '' },
        vdu2MakeModel: { type: String, default: '' },
        vdu2ManufactureDate: { type: String, default: '' },
        vdu2LastReplacementDate: { type: String, default: '' },

        pc1MakeModel: { type: String, default: '' },
        pc1ManufactureDate: { type: String, default: '' },
        pc1LastReplacementDate: { type: String, default: '' },
        pc2MakeModel: { type: String, default: '' },
        pc2ManufactureDate: { type: String, default: '' },
        pc2LastReplacementDate: { type: String, default: '' },

        vdu1PowerSupply: { type: String, default: '' },
        vdu2PowerSupply: { type: String, default: '' },

        tempFilesDeletionStatus: { type: String, default: '' },
        standbyMode: { type: String, default: '' },
        eiVersion: { type: String, default: '' },
        latestUpgrade: { type: String, default: '' },
        upgradeStatus: { type: String, default: '' },
        upgradeDate: { type: String, default: '' },
        mtRelayRoomStatus: { type: String, default: '' },

        warrantyAmcStatus: { type: String, default: '' },
        warrantyAmcFrom: { type: String, default: '' },
        warrantyAmcTo: { type: String, default: '' },
        acProvider: { type: String, default: '' },
        batteryChargerType: { type: String, default: '' },

        emergencyRouteReleaseCounter: { type: String, default: '' },
        registerAvailability: { type: String, default: '' },
        emrcKeyHolder: { type: String, default: '' },
        codalLife: { type: String, default: '' },
        networkSwitchStatus: { type: String, default: '' },
        commLinkIndication: { type: String, default: '' },
        systemFailureIndication: { type: String, default: '' },

        amcLastDate: { type: String, default: '' },
        amcFrom: { type: String, default: '' },
        amcTo: { type: String, default: '' },
        amcWorkDone: { type: String, default: '' },
        amcDeficiency: { type: String, default: '' },

        spareCardDetails: { type: String, default: '' },
        spareCardTestDate: { type: String, default: '' },

        emergencyPanelAvailability: { type: String, default: '' },
        emergencyPanelProvisionDate: { type: String, default: '' },
        emergencyPanelStatus: { type: String, default: '' },
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

const EIAssetModel: Model<EIAsset> = mongoose.models.EIAsset || mongoose.model<EIAsset>("EIAsset", EIAssetSchema);

export default EIAssetModel;
