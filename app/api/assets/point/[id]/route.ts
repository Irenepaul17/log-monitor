import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PointAssetModel from '@/app/models/PointAsset';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return NextResponse.json(
        { error: 'Direct updates are disabled. Please use the /api/assets/point/request endpoint.' },
        { status: 403 }
    );
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return NextResponse.json(
        { error: 'Direct deletion is disabled.' },
        { status: 403 }
    );
}
