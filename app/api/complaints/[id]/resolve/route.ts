import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ComplaintModel from '@/app/models/Complaint';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id } = await params;

        const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
            id,
            {
                status: 'Closed',
                rtTime: body.rtTime,
                actualFailureDetails: body.actualFailureDetails,
                trainDetention: body.trainDetention,
                rectificationDetails: body.rectificationDetails,
                resolvedBy: body.resolvedBy,
                resolvedDate: body.resolvedDate
            },
            { new: true }
        );

        if (!updatedComplaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json(updatedComplaint);
    } catch (error) {
        console.error('Failed to resolve complaint:', error);
        return NextResponse.json({
            error: 'Failed to resolve complaint',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
