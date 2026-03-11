import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/app/models/User';
import WorkReportModel from '@/app/models/WorkReport';
import ComplaintModel from '@/app/models/Complaint';
import PointAssetModel from '@/app/models/PointAsset';
import SignalAssetModel from '@/app/models/SignalAsset';
import TrackCircuitAssetModel from '@/app/models/TrackCircuitAsset';
import EIAssetModel from '@/app/models/EIAsset';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Count basic metrics
        const [
            totalUsers,
            totalReports,
            totalFailures,
            openFailures,
            eiCount,
            pointsCount,
            signalsCount,
            trackCircuitsCount
        ] = await Promise.all([
            UserModel.countDocuments(),
            WorkReportModel.countDocuments(),
            ComplaintModel.countDocuments(),
            ComplaintModel.countDocuments({ status: "Open" }),
            EIAssetModel.countDocuments(),
            PointAssetModel.countDocuments(),
            SignalAssetModel.countDocuments(),
            TrackCircuitAssetModel.countDocuments(),
        ]);

        return NextResponse.json({
            totalUsers,
            totalReports,
            totalFailures,
            openFailures,
            assetStats: {
                ei: eiCount,
                points: pointsCount,
                signals: signalsCount,
                trackCircuits: trackCircuitsCount
            }
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
