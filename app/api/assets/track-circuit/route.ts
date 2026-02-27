import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TrackCircuitAssetModel from '@/app/models/TrackCircuitAsset';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search');

        const query: any = {};
        if (search) {
            query.$or = [
                { station: new RegExp(search, 'i') },
                { sseSection: new RegExp(search, 'i') },
                { trackCircuitNo: new RegExp(search, 'i') },
                { make: new RegExp(search, 'i') },
                { type: new RegExp(search, 'i') },
            ];
        }

        const skip = (page - 1) * limit;

        const [rawAssets, total] = await Promise.all([
            TrackCircuitAssetModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            TrackCircuitAssetModel.countDocuments(query)
        ]);

        const assets = rawAssets.map(asset => ({
            ...asset.toObject(),
            id: asset._id.toString()
        }));

        return NextResponse.json({
            data: assets,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching Track Circuit assets:", error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    return NextResponse.json(
        { error: 'Direct creation is disabled. Please use the /api/assets/track-circuit/request endpoint.' },
        { status: 403 }
    );
}
