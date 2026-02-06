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

    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface PointAsset {
    id: string;
    // Location & General
    sseSection: string;
    station: string;
    pointNo: string;
    lineType: "Main Line" | "LoopLine";
    atKm: string; // At-Km
    locationNumber: string;

    // Technical Specs
    layout: string;
    throw: "143MM" | "220MM";
    endType: "Single End" | "Double End";
    pointMachineSlNo: string;
    yearOfManufacture: string;
    make: string;
    installedDate: string; // Installed Date

    // Motor Details
    motorSlNo: string;
    motorType: "IP67" | "NORMAL";
    motorMake: string;

    // Safety & Protection
    facingPoint: "Yes" | "No";
    antiTheftNut: "Yes" | "No";
    antiTheftNutStatus: "Full Set" | "Partial" | "Not provided";
    dateInstallAntiTheftFasteners: string;

    // P-Bracket & Stretcher Bar Protection
    pBracketProtection: "Yes" | "No";
    dateInstallPBracketProtection: string;
    lostMotionStretcherBarProtection: "Yes" | "No";
    dateInstallLostMotionProtection: string;

    // Insulation
    lastDatePointInsulationReplaced: string;
    duePointInsulationReplacement: string;
    ssdInsulation: "Claw" | "T type" | "N/A"; // "SSD Insulation (Claw / T type) only for 220mm point machine"

    // Water Logging
    michuangWaterLogging: "Yes" | "No"; // "MICHUANG WATER LOGGING (Fully Submerged for Very Heavy rain)"
    fullySubmergedHeavyRain: "Yes" | "No"; // "Fully Submerged for Heavy rain"

    // Galvanization
    galvanizedGroundConnections: "Yes" | "No";
    dateProvisionGalvanizedRoddings: string;
    fyProvisionGalvanizedRoddings: string;

    // Compliance / Checklist
    msFlatTieBarDetails: "Yes" | "No"; // "1. M.S. Flat tie bar..."
    ercMkIIIReplacement: "Yes" | "No"; // "2. ERC's MK-III..."
    insulatingLinerReplacement: "Yes" | "No"; // "3. insulating liner..."

    // Relays & Circuit
    circuit: string;
    noOfQBCARelays: number | string;
    pointGroupParallelingDone: "Yes" | "No";

    // Relay Dates
    wcrABDateManufacture: string;
    wcrABDateTested: string;
    wczr1DateManufacture: string;
    wczr1DateTested: string;
    nwczrDateManufacture: string;
    nwczrDateTested: string;
    rwczrDateManufacture: string;
    rwczrDateTested: string;

    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Equipment interface for signal components
export interface SignalEquipment {
    make: string;
    type: string;
    slNo: string;
    dom: string; // Date of Manufacture
    doi: string; // Date of Installation
    qty: number | string;
}

export interface SignalAsset {
    id: string;

    // Basic Information
    sno: string; // Serial Number
    section: string; // MAS Section
    stationAutoSectionLcIbs: string; // STATION/AUTOSECTION/LC/IBS
    route: string;
    signalNoShuntNo: string; // SIGNALNO/SHUNTNO
    signalType: string; // HOME/STARTER/LSS/CO/IND SH/SUB SH/AUTO/GATE/IB/REP
    lhsRhs: string; // LHS/RHS
    smmsAssetCreated: string;
    assetApprovedByInChargeSSE: string;

    // Equipment Categories - each has MAKE, TYPE, Sl No, DOM, DOI, QTY
    rg: SignalEquipment; // RG (Routing/General)
    hg: SignalEquipment; // HG (Home/General)
    hhg: SignalEquipment; // HHG
    dg: SignalEquipment; // DG (Distant/General)
    shunt: SignalEquipment; // SHUNT
    routeEquipment: SignalEquipment; // ROUTE
    amarker: SignalEquipment; // AMARKER (Approach Marker)
    callingon: SignalEquipment; // CALLINGON

    // LED Details / Signal Configurations
    aspect2: string; // 2Aspect
    aspect3: string; // 3Aspect
    aspect4: string; // 4Aspect
    shuntConfig: string; // Shunt
    ind: string; // Ind
    onPost: string;
    co: string; // CO
    routeConfig: string; // Route
    home: string;
    starter: string;
    ib: string; // IB
    gatesig: string; // Gatesig
    auto: string;
    retroReflectiveSignalNo: string; // Retro Reflective Signal No.

    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface TrackCircuitAsset {
    id: string;
    sseSection: string;
    station: string;
    trackCircuitNo: string;
    type: string;
    make: string;
    length: string;
    dateOfInstallation: string;
    finacialYear: string;
    relayType: string;
    relayMake: string;
    batteryType: string;
    batteryQty: string;
    chargerType: string;
    location: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


