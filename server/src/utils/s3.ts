import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
});

export async function createPresignedUpload(keyPrefix: string, contentType: string) {
  const key = `${keyPrefix}/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return { url, key, bucket: env.s3.bucket, region: env.s3.region };
}
