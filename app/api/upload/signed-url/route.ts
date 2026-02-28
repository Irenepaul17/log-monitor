import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    // URL valid for 30 minutes
    const url = await getSignedUrl(s3, command, { expiresIn: 1800 });
    return NextResponse.json({ url });
}
