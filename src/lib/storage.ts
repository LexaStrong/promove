// ProMove Object Storage Provider (Neon Object Storage / S3-compatible)
// Handles tenant-isolated storage for vehicle document PDFs, roadworthy inspection stickers,
// insurance certificates, fuel receipts, and maintenance invoices in compliance with Act 843.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageUploadResult {
  url: string;
  bucket: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface StorageProvider {
  uploadDocument(
    fileBuffer: Uint8Array | ArrayBuffer | Buffer,
    fileName: string,
    mimeType: string,
    orgId: string,
    category: 'documents' | 'receipts' | 'maintenance' | 'incidents'
  ): Promise<StorageUploadResult>;

  getSignedDownloadUrl(storageKey: string, bucket?: string, expirySeconds?: number): Promise<string>;
  deleteDocument(storageKey: string, bucket?: string): Promise<boolean>;
}

export class NeonObjectStorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private defaultBucket: string;
  private endpoint: string;

  constructor() {
    this.endpoint =
      process.env.NEON_STORAGE_ENDPOINT ||
      'https://br-old-moon-b4kw1lhy.storage.c-6.us-east-2.aws.neon.tech';
    this.defaultBucket = process.env.NEON_STORAGE_BUCKET || 'documents';

    const accessKeyId = process.env.NEON_STORAGE_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.NEON_STORAGE_SECRET_ACCESS_KEY || '';
    const region = process.env.NEON_STORAGE_REGION || 'us-east-2';

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Uploads vehicle document photos or PDFs to Neon Object Storage
   * with tenant-isolated key partitioning: tenants/{orgId}/{category}/{timestamp}_{filename}
   */
  async uploadDocument(
    fileBuffer: Uint8Array | ArrayBuffer | Buffer,
    fileName: string,
    mimeType: string,
    orgId: string,
    category: 'documents' | 'receipts' | 'maintenance' | 'incidents'
  ): Promise<StorageUploadResult> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File format ${mimeType} is not permitted. Only PDF and JPG/PNG/WEBP images are allowed.`);
    }

    const targetBucket = mimeType.startsWith('image/') ? 'images' : this.defaultBucket;
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `tenants/${orgId}/${category}/${Date.now()}_${sanitizedName}`;

    const buffer = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer as ArrayBuffer);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: targetBucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          orgId,
          category,
          originalName: sanitizedName,
        },
      })
    );

    const url = `${this.endpoint}/${targetBucket}/${storageKey}`;

    return {
      url,
      bucket: targetBucket,
      storageKey,
      fileSizeBytes: buffer.byteLength,
      mimeType,
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates a secure pre-signed download URL for confidential vehicle documents
   */
  async getSignedDownloadUrl(
    storageKey: string,
    bucket = this.defaultBucket,
    expirySeconds = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: storageKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expirySeconds });
    } catch {
      // Fallback direct URL if presigning encounters a local client issue
      return `${this.endpoint}/${bucket}/${storageKey}`;
    }
  }

  /**
   * Deletes a file from Neon Object Storage
   */
  async deleteDocument(storageKey: string, bucket = this.defaultBucket): Promise<boolean> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: storageKey,
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}

// Global default Neon Object Storage provider instance
export const storageProvider = new NeonObjectStorageProvider();
