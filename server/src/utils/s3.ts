import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { randomUUID } from "crypto";

export const s3 = new S3Client({
  region: env.s3.region,
  // Only use explicit credentials if both keys are present.
  // If omitted, the SDK uses the default credential chain
  // (IAM instance role on EC2, env vars, ~/.aws/credentials, etc.)
  ...(env.s3.accessKeyId && env.s3.secretAccessKey
    ? { credentials: { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey } }
    : {}),
});

/**
 * Convert a stored S3 public URL back to its key, then generate a fresh
 * pre-signed GET URL valid for `expiresIn` seconds (default 3600 = 1 hour).
 * Falls back to the original URL if parsing fails.
 */
export async function signStreamUrl(storedUrl: string, expiresIn = 3600): Promise<string> {
  try {
    const bucketHost = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/`;
    if (!storedUrl.startsWith(bucketHost)) return storedUrl; // not an S3 URL — return as-is
    const key = decodeURIComponent(storedUrl.slice(bucketHost.length));
    const command = new GetObjectCommand({ Bucket: env.s3.bucket, Key: key });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch {
    return storedUrl;
  }
}

export async function createPresignedUpload(keyPrefix: string, contentType: string) {
  const key = `${keyPrefix}/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`;
  
  return { 
    url: uploadUrl,     // Presigned URL for uploading
    fileUrl,            // Final public URL to use in database
    key,                // S3 key/path
    bucket: env.s3.bucket, 
    region: env.s3.region 
  };
}

export interface S3Video {
  key: string;
  url: string;
  fileName: string;
  size: number;
  lastModified: Date;
}

/**
 * List all video files from a specific S3 folder
 */
export async function listVideosFromFolder(folderPrefix: string): Promise<S3Video[]> {
  const command = new ListObjectsV2Command({
    Bucket: env.s3.bucket,
    Prefix: folderPrefix.endsWith('/') ? folderPrefix : `${folderPrefix}/`,
  });

  try {
    const response = await s3.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      return [];
    }

    // Filter for video files only
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    const videos = response.Contents
      .filter(item => {
        if (!item.Key || item.Key.endsWith('/')) return false; // Skip folders
        return videoExtensions.some(ext => item.Key!.toLowerCase().endsWith(ext));
      })
      .map(item => {
        const key = item.Key!;
        const fileName = key.split('/').pop() || key;
        const encodedKey = key.split('/').map(encodeURIComponent).join('/');
        
        return {
          key,
          url: `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${encodedKey}`,
          fileName,
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
        };
      })
      .sort((a, b) => a.fileName.localeCompare(b.fileName)); // Sort alphabetically

    return videos;
  } catch (error) {
    console.error('Error listing S3 videos:', error);
    throw new Error('Failed to list videos from S3');
  }
}

/**
 * Generate a presigned URL for viewing a private S3 object
 */
export async function createPresignedView(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn });
}
