import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EIAssetModel from '@/app/models/EIAsset';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};
        if (search) {
            query.$or = [
                { station: { $regex: search, $options: 'i' } },
                { section: { $regex: search, $options: 'i' } },
                { serialNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const assets = await EIAssetModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await EIAssetModel.countDocuments(query);

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
        console.error('Error fetching EI assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const newAsset = await EIAssetModel.create(body);

        return NextResponse.json(newAsset, { status: 201 });
    } catch (error) {
        console.error('Error creating EI asset:', error);
        return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
    }
}
