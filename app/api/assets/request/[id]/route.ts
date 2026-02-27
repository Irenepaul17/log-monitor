import { NextResponse } from 'next/server';
import { processAssetRequest } from '@/lib/asset-approval';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, comments, reviewerId } = body;

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!reviewerId) {
            return NextResponse.json({ error: 'Reviewer ID is required' }, { status: 400 });
        }

        const statusMap: Record<string, 'approved' | 'rejected'> = {
            'approve': 'approved',
            'reject': 'rejected'
        };

        const result = await processAssetRequest(id, reviewerId, statusMap[action], comments);

        return NextResponse.json({
            message: `Request ${action}d successfully`,
            request: result.request
        });

    } catch (error: any) {
        console.error("Error processing asset request:", error);

        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        if (error.message === 'Request not found or already processed') {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
    }
}
