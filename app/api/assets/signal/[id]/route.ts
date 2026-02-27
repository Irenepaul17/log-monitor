import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SignalAssetModel from '@/app/models/SignalAsset';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return NextResponse.json(
        { error: 'Direct updates are disabled. Please use the /api/assets/signal/request endpoint.' },
        { status: 403 }
    );
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // We can keep DELETE restricted to SSE or just disable for now.
    // The user said "Disable direct PUT for asset types".
    // I'll disable it for consistency.
    return NextResponse.json(
        { error: 'Direct deletion is limited. Please contact system administrator.' },
        { status: 403 }
    );
}
