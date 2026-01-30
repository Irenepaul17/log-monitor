import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/app/models/User';

const DEFAULT_USERS = [
    { name: 'Sr. DSTE (Admin)', phone: '1234567890', pass: 'admin123', role: 'sr-dste', sub: 'Sr. DSTE', email: 'sr.dste@railnet.gov.in', pfNumber: 'PF0001' },
    { name: 'DSTE Rajesh', phone: '9000000001', pass: 'dste123', role: 'dste', sub: 'DSTE', superiorId: 'u1', email: 'dste.rajesh@railnet.gov.in', pfNumber: 'PF1001' },
    { name: 'ADSTE 1 Sunita', phone: '9000000002', pass: 'adste123', role: 'adste', sub: 'ADSTE 1', superiorId: 'u2', teamId: '1', email: 'adste1@railnet.gov.in', pfNumber: 'PF2001' },
    { name: 'SSE 1 Amit', phone: '9000000003', pass: 'sse123', role: 'sse', sub: 'SSE 1', superiorId: 'u3', teamId: '1', email: 'sse1@railnet.gov.in', pfNumber: 'PF3001' },
    { name: 'JE 1 Deepak', phone: '9000000004', pass: 'je123', role: 'je', sub: 'JE 1', superiorId: 'u4', teamId: '1', email: 'je1@railnet.gov.in', pfNumber: 'PF4001' },
    { name: 'Tech 1 Ramesh', phone: '9000000007', pass: 'tech123', role: 'technician', sub: 'Tech 1', superiorId: 'u5', teamId: '1', email: 'tech1@railnet.gov.in', pfNumber: 'PF5001' },
    { name: 'ADSTE 2 Rajesh', phone: '9000000005', pass: 'adste123', role: 'adste', sub: 'ADSTE 2', superiorId: 'u2', teamId: '2', email: 'adste2@railnet.gov.in', pfNumber: 'PF2002' },
    { name: 'SSE 2 Vikram', phone: '9000000008', pass: 'sse123', role: 'sse', sub: 'SSE 2', superiorId: 'u7', teamId: '2', email: 'sse2@railnet.gov.in', pfNumber: 'PF3002' },
    { name: 'JE 2 Kavita', phone: '9000000006', pass: 'je123', role: 'je', sub: 'JE 2', superiorId: 'u8', teamId: '2', email: 'je2@railnet.gov.in', pfNumber: 'PF4002' },
    { name: 'Tech 2 Suresh', phone: '9000000009', pass: 'tech123', role: 'technician', sub: 'Tech 2', superiorId: 'u9', teamId: '2', email: 'tech2@railnet.gov.in', pfNumber: 'PF5002' },
];

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { phone, pass } = await request.json();

        // Check if any users exist, if not seed default users
        const userCount = await UserModel.countDocuments();
        if (userCount === 0) {
            console.log('Seeding default users...');
            await UserModel.insertMany(DEFAULT_USERS);
        }

        const user = await UserModel.findOne({ phone, pass });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
