import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
        return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
    }

    const key = `attachments/${uuid()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ uploadUrl, key });
}
