// Form mappings for Signal Technician Log Book
// Based on Google Form conditional logic

export const SSE_SECTIONS = [
    'MAS', 'BBQ', 'TVT', 'GPD', 'SPE', 'NYP', 'TRL', 'AJJ E', 'AJJW',
    'TRT', 'KPDE', 'KPDW', 'AB', 'JTJ', 'MSB', 'MS', 'TBM', 'CGL', 'TMV'
] as const;

export type SSESection = typeof SSE_SECTIONS[number];

// SSE Section → Station Mappings
export const SSE_TO_STATIONS: Record<SSESection, string[]> = {
    'MAS': ['MAS', 'MASS', '20LF'],
    'BBQ': ['BBQ', 'KOK', 'WST-VPY', 'WST', 'RPM', 'VPY-KOK', 'BBQ-VPY', 'VPY', 'VPY-VLK', 'PEW', 'PEW-VLK', 'VLK', 'VLK-ABU', 'ABU', 'ABU-AVD'],
    'TVT': ['KOK-TNP', 'TNP', 'TNP-TVT', 'TVT', 'TVT-ENR', 'ENR', 'ENR-AIPP', 'AIPP', 'AIP', 'TNPM'],
    'GPD': ['AIP-MJR', 'MJR', 'MJR-PON', 'PON', 'PON-KVP', 'KVP', 'KVP-GPD', 'GPD'],
    'SPE': ['GPD-ELR', 'ELR', 'ELR-AKM', 'AKM', 'AKM-TADA', 'TADA', 'TADA-SPE', 'SPE', 'SPE-PEL', 'PEL'],
    'NYP': ['PEL-DVR', 'DVR', 'DVR-NYP', 'NYP', 'NYP-PYA', 'PYA', 'PYA-ODR', 'ODR', 'ODR-GDR'],
    'TRL': ['AVD', 'AVD-PAB', 'PAB', 'PTMS', 'E DEPOT', 'PAB-TI', 'TI', 'TI-TRL', 'TRL'],
    'AJJ E': ['TRL-KBT', 'KBT', 'KBT-TO', 'TO', 'TO-AJJ', 'AJJ'],
    'AJJW': ['AJJN', 'MLPM', 'MLPM-CTRE', 'CTRE', 'CTRE-MDVE', 'MDVE', 'MDVE-SHU', 'SHU'],
    'TRT': ['AJJN-TRT', 'IPT', 'TRT', 'TRT-POI', 'POI', 'POI-NG', 'NG', 'NG-VGA', 'VGA', 'VGA-PUT', 'PUT', 'PUT-TDK', 'TDK', 'TDK-SVF', 'SVF-PUDI', 'TDK-PUDI', 'PUDI', 'PUDI-RU', 'SVF'],
    'KPDE': ['SHU-TUG', 'TUG', 'TUG-WJR', 'WJR', 'WJR-MCN', 'MCN', 'MCN-THL', 'THL', 'THL-SVUR', 'SVUR', 'SVUR-KPD', 'KPD'],
    'KPDW': ['KPD-LTI', 'LTI', 'LTI-KVN', 'KVN', 'KVN-GYM', 'GYM', 'GYM-VLT', 'VLT', 'VLT-MPI', 'MPI', 'MPI-PCKM', 'PCKM'],
    'AB': ['PCKM-AB', 'AB', 'AB-VGM', 'VGM', 'VGM-VN', 'VN', 'VN-KDY', 'KDY', 'KDY-JTJ'],
    'JTJ': ['JTJ', 'JTJ AUX'],
    'MSB': ['MSB', 'MSB-RPM', 'MSB-MS', 'MSB-MPK', 'MPK', 'MSB-MCPK', 'MCPK', 'MCPK-MTMY', 'MTMY', 'MTMY-VLCY', 'VLCY'],
    'MS': ['MS', 'MS-MKK', 'MKK', 'MKK-STM', 'STM', 'STM-PV', 'PV', 'PV-CMP'],
    'TBM': ['CMP-TBM', 'PV-TBM', 'TBM', 'TBM-VDR', 'VDR', 'VDR-GI', 'TBM-GI', 'GI', 'GI-CTM', 'CTM', 'CTM-SKL', 'GI-SKL', 'SKL'],
    'CGL': ['SKL-CGL', 'CGL', 'CGL-OV', 'OV', 'OV-KGZ', 'PTM', 'KGZ', 'KGZ-MMK', 'MMK', 'CGL-PALR', 'PALR', 'PALR-WJ', 'WJ', 'WJ-CJ', 'CJ', 'CJ-TMLP', 'TMLP', 'TMLP-MLPM'],
    'TMV': ['MMK-MLMR', 'PQM', 'MLMR', 'MLMR-TZD', 'TZD', 'TZD-OLA', 'OLA', 'OLA-TMV', 'PCLM', 'TMV', 'TMV-MTL', 'MTL', 'MTL-PEI', 'PEI', 'PEI-VVN', 'VVN', 'VVN-MYP', 'MYP', 'MYP-VM']
};

// Shift Options
export const SHIFT_OPTIONS = [
    'Night Odd Hrs to 07:00',
    'Morning',
    'Evening',
    'Night Up to Odd Hrs',
    'Other'
] as const;

// Work Classification Options
export const WORK_CLASSIFICATIONS = [
    'Maintenance',
    'Failure Attention',
    'S & T Special work',
    'Work with other Departments',
    'Replacement of Assets',
    'Select for entering Disconnection',
    'Only Disconnection called and cancelled',
    'Miscellaneous'
] as const;

export type WorkClassification = typeof WORK_CLASSIFICATIONS[number];

// Gear Maintained Options (for Maintenance classification)
export const GEAR_OPTIONS = [
    'Track',
    'Signal',
    'Point',
    'Location Box',
    'Power Room',
    'Relay room',
    'LC Gate',
    'IPS',
    'Relay room LC Gate',
    'AFTC/MSDAC HUT',
    'Auto Section',
    'General Maintenance',
    'Other'
] as const;

// Failure Attention Options
export const FAILURE_ATTENTION_OPTIONS = [
    'Track',
    'Signal',
    'Point',
    'Location Box',
    'Power Room',
    'Relay room',
    'LC Gate',
    'IPS',
    'Relay room LC Gate',
    'AFTC/MSDAC HUT',
    'Auto Section',
    'Other'
] as const;

// S&T Special Work Options
export const SPECIAL_WORK_OPTIONS = [
    'Track',
    'Signal',
    'Point',
    'Location Box',
    'Power Room',
    'Relay room',
    'LC Gate',
    'HUT',
    'Auto Section',
    'Other'
] as const;

// Failure Status Options
export const FAILURE_STATUS_OPTIONS = [
    'Yes & Booked',
    'Yes & Attended',
    'No Failures'
] as const;

// Helper function to get stations for a given SSE Section
export function getStationsForSSE(sseSection: SSESection | string): string[] {
    return SSE_TO_STATIONS[sseSection as SSESection] || [];
}

// Helper function to check if a work classification requires specific fields
export function requiresGearSelection(classification: string): boolean {
    return classification === 'Maintenance';
}

export function requiresFailureDetails(classification: string): boolean {
    return classification === 'Failure Attention';
}

export function requiresSpecialWorkDetails(classification: string): boolean {
    return classification === 'S & T Special work';
}

export function requiresDisconnectionDetails(classification: string): boolean {
    return classification === 'Select for entering Disconnection' ||
        classification === 'Only Disconnection called and cancelled';
}
