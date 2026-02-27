import { NextResponse } from 'next/server';
import { submitAssetRequest } from '@/lib/asset-approval';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { assetId, proposedData, requester } = body;

        if (!proposedData || !requester) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await submitAssetRequest({
            assetId,
            assetType: 'point',
            proposedData,
            requester
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error("Error creating point asset request:", error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}
