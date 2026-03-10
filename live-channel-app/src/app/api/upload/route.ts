import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const AWS_REGION = process.env.AWS_REGION ?? "ap-south-1"; // Mumbai – lowest latency for India
const S3_BUCKET = process.env.S3_BUCKET_NAME ?? "";
const S3_KEY_PREFIX = process.env.S3_KEY_PREFIX ?? "livetv/";

// Presigned URL expires in 5 minutes – enough for direct browser upload
const URL_EXPIRES_IN = 300;

/**
 * POST /api/upload
 *
 * Body: { fileName: string; contentType: string }
 *
 * Returns a pre-signed S3 PUT URL so the browser can upload directly to the
 * S3 bucket in the Mumbai region (ap-south-1) for sub-2-second upload start
 * times inside India.  The object URL is also returned so it can be stored
 * in the playlist after the upload completes.
 */
export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!S3_BUCKET) {
      return NextResponse.json({ error: "S3_BUCKET_NAME is not configured" }, { status: 500 });
    }

    const { fileName, contentType } = (await request.json()) as {
      fileName: string;
      contentType: string;
    };

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // Sanitise the filename: replace spaces, keep extension, cap at 200 chars
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
    const objectKey = `${S3_KEY_PREFIX}${Date.now()}_${safe}`;

    const client = new S3Client({
      region: AWS_REGION,
      // Credentials come from environment variables:
      //   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (and optionally AWS_SESSION_TOKEN)
    });

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: URL_EXPIRES_IN });

    // The public URL that can be stored in the playlist once upload is done.
    // This assumes the bucket objects are publicly readable (or served via CloudFront).
    const objectUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${objectKey}`;

    return NextResponse.json({ uploadUrl, objectUrl, objectKey });
  } catch (error) {
    console.error("POST /api/upload error", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
