/**
 * One-off script to apply the CORS policy to the S3 bucket.
 * Run with: npx tsx src/migrations/set-s3-cors.ts
 * The EC2 instance must have an IAM role with s3:PutBucketCors permission.
 */
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const s3 = new S3Client({ region: env.s3.region });

const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
      AllowedOrigins: [
        "http://13.205.72.30:3039",
        "http://13.205.72.30:5173",
        "http://localhost:3039",
        "http://localhost:5173",
      ],
      ExposeHeaders: ["ETag", "x-amz-request-id", "x-amz-id-2"],
      MaxAgeSeconds: 3000,
    },
  ],
};

try {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: env.s3.bucket,
      CORSConfiguration: corsConfig,
    })
  );
  console.log(`✅ CORS policy applied to bucket: ${env.s3.bucket}`);
} catch (err) {
  console.error("❌ Failed to apply CORS:", err);
  process.exit(1);
}
