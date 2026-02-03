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
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updatedAsset = await EIAssetModel.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedAsset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json(updatedAsset);
    } catch (error) {
        console.error('Error updating EI asset:', error);
        return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedAsset = await EIAssetModel.findByIdAndDelete(id);

        if (!deletedAsset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        console.error('Error deleting EI asset:', error);
        return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }
}
