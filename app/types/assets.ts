export interface EIAsset {
    id: string;
    // General Info
    serialNumber?: string;
    sseSection: string;
    station: string;
    stationAutoSection: string;
    section: string;
    route: string;
    make: string;
    numberOfRoutes: string;
    state: string;
    dateOfInstallation: string;
    financialYear: string;

    // Technical
    centralisedDistributed: string;
    numberOfOCs: string;
    rdsoTypicalCircuit: string;
    powerCableRedundancy: string;
    tdcRedundantPowerCable: string;
    systemType: string; // Dual VDU/Panel etc

    // Hardware - VDUs
    vdu1MakeModel: string;
    vdu1ManufactureDate: string;
    vdu1LastReplacementDate: string;
    vdu2MakeModel: string;
    vdu2ManufactureDate: string;
    vdu2LastReplacementDate: string;

    // Hardware - Embedded PCs
    pc1MakeModel: string;
    pc1ManufactureDate: string;
    pc1LastReplacementDate: string;
    pc2MakeModel: string;
    pc2ManufactureDate: string;
    pc2LastReplacementDate: string;

    // Hardware - Power
    vdu1PowerSupply: string;
    vdu2PowerSupply: string;

    // System Status
    tempFilesDeletionStatus: string;
    standbyMode: string; // HOT/WARM
    eiVersion: string;
    latestUpgrade: string;
    upgradeStatus: string;
    upgradeDate: string;
    mtRelayRoomStatus: string;

    // Maintenance & Warranty
    warrantyAmcStatus: string;
    warrantyAmcFrom: string;
    warrantyAmcTo: string;
    acProvider: string;
    batteryChargerType: string;

    // Emergency & Operations
    emergencyRouteReleaseCounter: string;
    registerAvailability: string;
    emrcKeyHolder: string;
    codalLife: string;
    networkSwitchStatus: string;
    commLinkIndication: string;
    systemFailureIndication: string;

    // AMC Details
    amcLastDate: string;
    amcFrom: string;
    amcTo: string;
    amcWorkDone: string;
    amcDeficiency: string;

    // Spares
    spareCardDetails: string;
    spareCardTestDate: string;

    // Emergency Panel
    emergencyPanelAvailability: string;
    emergencyPanelProvisionDate: string;
    emergencyPanelStatus: string;

    createdAt?: string;
    updatedAt?: string;
}
