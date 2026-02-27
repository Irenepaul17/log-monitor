import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AssetUpdateRequestModel from '@/app/models/AssetUpdateRequest';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const sseId = searchParams.get('sseId');
        const status = searchParams.get('status') || 'pending';

        if (!sseId) {
            return NextResponse.json({ error: 'SSE ID is required' }, { status: 400 });
        }

        // Leveraging the compound index: { sseId: 1, status: 1 }
        const requests = await AssetUpdateRequestModel.find({
            sseId,
            status
        }).sort({ createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching sse asset requests:", error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
