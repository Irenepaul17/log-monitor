import dbConnect from './mongodb';
import AssetUpdateRequestModel from '@/app/models/AssetUpdateRequest';
import SignalAssetModel from '@/app/models/SignalAsset';
import PointAssetModel from '@/app/models/PointAsset';
import EIAssetModel from '@/app/models/EIAsset';
import TrackCircuitAssetModel from '@/app/models/TrackCircuitAsset';
import UserModel from '@/app/models/User';
import NotificationModel from '@/app/models/Notification';
import { sendEmail } from './mail';

// Map assetType to Model
const AssetModelMap: Record<string, any> = {
    'signal': SignalAssetModel,
    'point': PointAssetModel,
    'ei': EIAssetModel,
    'track-circuit': TrackCircuitAssetModel
};

// Field Whitelists to prevent unintended injections
const ASSET_WHITELISTS: Record<string, string[]> = {
    'signal': [
        'sno', 'section', 'stationAutoSectionLcIbs', 'route', 'signalNoShuntNo', 'signalType', 'lhsRhs',
        'smmsAssetCreated', 'assetApprovedByInChargeSSE', 'rg', 'hg', 'hhg', 'dg', 'shunt',
        'routeEquipment', 'amarker', 'callingon', 'aspect2', 'aspect3', 'aspect4', 'shuntConfig',
        'ind', 'onPost', 'co', 'routeConfig', 'home', 'starter', 'ib', 'gatesig', 'auto', 'retroReflectiveSignalNo'
    ],
    'point': [
        'sseSection', 'station', 'pointNo', 'lineType', 'atKm', 'locationNumber', 'layout', 'throw',
        'endType', 'pointMachineSlNo', 'yearOfManufacture', 'make', 'installedDate', 'motorSlNo',
        'motorType', 'motorMake', 'facingPoint', 'antiTheftNut', 'antiTheftNutStatus', 'dateInstallAntiTheftFasteners',
        'pBracketProtection', 'dateInstallPBracketProtection', 'lostMotionStretcherBarProtection', 'dateInstallLostMotionProtection',
        'lastDatePointInsulationReplaced', 'duePointInsulationReplacement', 'ssdInsulation', 'michuangWaterLogging',
        'fullySubmergedHeavyRain', 'galvanizedGroundConnections', 'dateProvisionGalvanizedRoddings', 'fyProvisionGalvanizedRoddings',
        'msFlatTieBarDetails', 'ercMkIIIReplacement', 'insulatingLinerReplacement', 'circuit', 'noOfQBCARelays',
        'pointGroupParallelingDone', 'wcrABDateManufacture', 'wcrABDateTested', 'wczr1DateManufacture', 'wczr1DateTested',
        'nwczrDateManufacture', 'nwczrDateTested', 'rwczrDateManufacture', 'rwczrDateTested'
    ],
    'ei': [
        'serialNumber', 'sseSection', 'station', 'stationAutoSection', 'section', 'route', 'make', 'numberOfRoutes',
        'state', 'dateOfInstallation', 'financialYear', 'centralisedDistributed', 'numberOfOCs', 'rdsoTypicalCircuit',
        'powerCableRedundancy', 'tdcRedundantPowerCable', 'systemType', 'vdu1MakeModel', 'vdu1ManufactureDate',
        'vdu1LastReplacementDate', 'vdu2MakeModel', 'vdu2ManufactureDate', 'vdu2LastReplacementDate', 'pc1MakeModel',
        'pc1ManufactureDate', 'pc1LastReplacementDate', 'pc2MakeModel', 'pc2ManufactureDate', 'pc2LastReplacementDate',
        'vdu1PowerSupply', 'vdu2PowerSupply', 'tempFilesDeletionStatus', 'standbyMode', 'eiVersion', 'latestUpgrade',
        'upgradeStatus', 'upgradeDate', 'mtRelayRoomStatus', 'warrantyAmcStatus', 'warrantyAmcFrom', 'warrantyAmcTo',
        'acProvider', 'batteryChargerType', 'emergencyRouteReleaseCounter', 'registerAvailability', 'emrcKeyHolder',
        'codalLife', 'networkSwitchStatus', 'commLinkIndication', 'systemFailureIndication', 'amcLastDate', 'amcFrom',
        'amcTo', 'amcWorkDone', 'amcDeficiency', 'spareCardDetails', 'spareCardTestDate', 'emergencyPanelAvailability',
        'emergencyPanelProvisionDate', 'emergencyPanelStatus'
    ],
    'track-circuit': [
        'sseSection', 'station', 'trackCircuitNo', 'type', 'make', 'length', 'dateOfInstallation', 'finacialYear',
        'relayType', 'relayMake', 'batteryType', 'batteryQty', 'chargerType', 'location', 'status'
    ]
};

// Required fields per asset type — validated before any DB write
const REQUIRED_FIELDS: Record<string, string[]> = {
    'point': ['sseSection', 'station', 'pointNo', 'lineType'],
    'signal': ['section', 'signalNoShuntNo'],
    'ei': ['serialNumber', 'sseSection', 'station'],
    'track-circuit': ['sseSection', 'station', 'trackCircuitNo', 'type'],
};

function validateAssetData(type: string, data: any) {
    const required = REQUIRED_FIELDS[type];
    if (!required) return; // No required fields configured — allow
    const missing = required.filter(f => !data[f] || String(data[f]).trim() === '');
    if (missing.length > 0) {
        throw new Error(
            `${type.charAt(0).toUpperCase() + type.slice(1)} asset: the following required fields are missing or empty: ${missing.join(', ')}`
        );
    }
}

function sanitizeAssetData(type: string, data: any) {
    const whitelist = ASSET_WHITELISTS[type];
    if (!whitelist) throw new Error(`Invalid asset type for sanitization: ${type}`);

    const sanitized: any = {};
    whitelist.forEach(key => {
        if (data[key] !== undefined) {
            sanitized[key] = data[key];
        }
    });
    return sanitized;
}

interface SubmitRequestParams {
    assetId: string | null;
    assetType: 'signal' | 'point' | 'ei' | 'track-circuit';
    proposedData: any;
    requester: {
        id: string;
        name: string;
        role: string;
        teamId: string;
    };
}

/**
 * Submits an asset update request. 
 */
export async function submitAssetRequest(params: SubmitRequestParams) {
    await dbConnect();
    const { assetId, assetType, proposedData, requester } = params;

    // Sanitize input data
    const sanitizedData = sanitizeAssetData(assetType, proposedData);

    // For NEW asset registrations, ensure all core required fields are present
    // so that invalid requests are rejected at creation time instead of
    // failing much later during SSE approval.
    const isNewAsset = !assetId;
    if (isNewAsset) {
        validateAssetData(assetType, sanitizedData);
    }

    // 1. Find the target SSE for this request
    const sse = await UserModel.findOne({ role: 'sse', teamId: requester.teamId }).lean().select('_id email');
    const sseId = sse?._id?.toString();

    const isSSE = requester.role === 'sse';

    // Safety check: Ensure an SSE exists for the team if not an SSE auto-approval
    if (!sseId && !isSSE) {
        throw new Error('No SSE assigned to your team to approve this request.');
    }

    const initialStatus = isSSE ? 'approved' : 'pending';

    // Create Request Record (Audit Trail)
    const request = await AssetUpdateRequestModel.create({
        assetId,
        assetType,
        proposedData: sanitizedData,
        requestedBy: requester.id,
        requestedByName: requester.name,
        teamId: requester.teamId,
        sseId,
        status: initialStatus,
        autoApproved: isSSE,
        reviewedBy: isSSE ? requester.id : undefined,
        reviewedAt: isSSE ? new Date() : undefined
    });

    // Handle Auto-Approval for SSE
    if (isSSE) {
        const TargetModel = AssetModelMap[assetType];
        if (!TargetModel) throw new Error(`Invalid asset type: ${assetType}`);

        if (assetId) {
            await TargetModel.findByIdAndUpdate(assetId, { $set: sanitizedData });
        } else {
            // Extra safety for SSE auto‑approval (already validated above for new assets)
            validateAssetData(assetType, sanitizedData);
            await TargetModel.create(sanitizedData);
        }
    }

    // Trigger Notifications (fire-and-forget, non-blocking)
    if (!isSSE && sseId) {
        NotificationModel.create({
            receiverId: sseId,
            title: 'Asset Approval Request',
            message: `New ${assetType} request submitted by ${requester.name}`,
            sourceType: 'asset-edit',
            sourceId: request._id.toString(),
            status: 'unread'
        }).catch(err => console.error("Failed to create notification for SSE asset request", err));

        // Email Notification (External, keep outside or handle failure gracefully)
        if (sse && sse.email) {
            sendEmail({
                to: sse.email,
                subject: `🔔 New Asset Approval Request: ${assetType.toUpperCase()}`,
                html: `<p>New ${assetType} request from ${requester.name}. Please review via dashboard.</p>`
            }).catch(err => console.error("Email notification failed", err));
        }
    }

    console.info(`[ASSET_REQUEST] ${isSSE ? 'Auto-approved' : 'Submitted'} by ${requester.id} (${requester.name}) for team ${requester.teamId}. RequestID: ${request._id}`);

    return {
        success: true,
        message: isSSE ? 'Asset updated directly (Auto-approved)' : 'Request submitted for SSE approval',
        request
    };
}

/**
 * Processes a pending request (Approve/Reject).
 */
export async function processAssetRequest(requestId: string, reviewerId: string, action: 'approved' | 'rejected', comments?: string) {
    await dbConnect();

    // 1. Authorization & Validity Check
    const reviewer = await UserModel.findById(reviewerId).lean().select('role teamId');
    if (!reviewer || reviewer.role !== 'sse') {
        throw new Error('Unauthorized: Only SSEs can process requests.');
    }

    const request = await AssetUpdateRequestModel.findById(requestId);
    if (!request || request.status !== 'pending') {
        throw new Error('Request not found or already processed.');
    }

    // Ensure the SSE is the one assigned or at least in the same team
    if (request.sseId && request.sseId.toString() !== reviewerId) {
        // Fallback: If not specifically assigned, check if they are in the same team
        if (!reviewer.teamId || request.teamId !== reviewer.teamId.toString()) {
            throw new Error('Unauthorized: You are not assigned to this request team.');
        }
    }

    try {
        request.status = action;
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.comments = comments;
        await request.save();

        if (action === 'approved') {
            const TargetModel = AssetModelMap[request.assetType];
            if (!TargetModel) throw new Error(`Invalid asset type: ${request.assetType}`);

            if (request.assetId) {
                await TargetModel.findByIdAndUpdate(request.assetId, { $set: request.proposedData });
            } else {
                // If it was a "new asset" request — validate required fields first
                validateAssetData(request.assetType, request.proposedData);
                await TargetModel.create(request.proposedData);
            }
        }

        // Create success notification for requester if approved
        if (action === 'approved') {
            await NotificationModel.create({
                receiverId: request.requestedBy,
                title: 'Asset Request Approved',
                message: `Your ${request.assetType} request has been approved by ${reviewer.name || reviewerId}`,
                sourceType: 'asset-edit',
                sourceId: request._id.toString(),
                status: 'unread'
            });
        }

        console.info(`[ASSET_APPROVAL] Request ${requestId} ${action} by SSE ${reviewerId}. Team: ${request.teamId}`);

        return { success: true, request };
    } catch (error: any) {
        // Provide a clearer, user‑friendly error for validation issues
        if (error && (error.name === 'ValidationError' || /validation failed/i.test(error.message || ''))) {
            const details = error.message || 'Asset validation failed';
            throw new Error(
                `Asset approval failed due to missing or invalid required fields. Please ask the requester to correct the data (e.g., ensure Station is filled for Point assets) and resubmit. Details: ${details}`
            );
        }
        throw error;
    }
}
