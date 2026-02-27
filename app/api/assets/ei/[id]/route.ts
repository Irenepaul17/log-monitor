import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EIAssetModel from '@/app/models/EIAsset';

// Fix for Next.js 15+ dynamic route params
// In newer Next.js versions, params is a Promise or needs to be awaited if treated as such depending on configuration.
// However, the standard signature for App Router API routes is (request, { params }).
// We will use standard type signature.

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return NextResponse.json(
        { error: 'Direct updates are disabled. Please use the /api/assets/ei/request endpoint.' },
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
