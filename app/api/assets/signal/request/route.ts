import { NextResponse } from 'next/server';
import { submitAssetRequest } from '@/lib/asset-approval';
import AssetUpdateRequestModel from '@/app/models/AssetUpdateRequest';
import dbConnect from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { assetId, proposedData, requester } = body;

        if (!proposedData || !requester) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await submitAssetRequest({
            assetId,
            assetType: 'signal',
            proposedData,
            requester
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error("Error creating signal asset request:", error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');
        const status = searchParams.get('status') || 'pending';

        const query: any = { status, assetType: 'signal' };
        if (teamId) query.teamId = teamId;

        const requests = await AssetUpdateRequestModel.find(query).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching signal asset requests:", error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
