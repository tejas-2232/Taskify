import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Check if running in local development mode
const isLocalDev = !process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

// Initialize Google Cloud Storage only if configured
let storage: Storage | null = null;
let bucket: any = null;

if (!isLocalDev) {
  storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
  if (bucketName) {
    bucket = storage.bucket(bucketName);
  }
}

// Create local uploads directory for development
const localUploadsDir = path.join(process.cwd(), 'uploads');
if (isLocalDev && !fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export interface UploadResult {
  filename: string;
  gcsPath: string;
  publicUrl: string;
}

export const uploadFile = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const filename = `${uuidv4()}${fileExtension}`;
    const gcsPath = `users/${userId}/files/${filename}`;

    if (isLocalDev) {
      // Local development: save to local filesystem
      const userDir = path.join(localUploadsDir, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      
      const localFilePath = path.join(userDir, filename);
      fs.writeFileSync(localFilePath, fileBuffer);
      
      return {
        filename,
        gcsPath: localFilePath, // Store local path instead of GCS path
        publicUrl: `http://localhost:${process.env.PORT || 3001}/files/download/${filename}`,
      };
    } else {
      // Production: use Google Cloud Storage
      if (!bucket) {
        throw new Error('Google Cloud Storage not configured');
      }
      
      const file = bucket.file(gcsPath);
      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
      const publicUrl = `gs://${bucketName}/${gcsPath}`;

      return {
        filename,
        gcsPath,
        publicUrl,
      };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

export const deleteFile = async (gcsPath: string): Promise<void> => {
  try {
    if (isLocalDev) {
      // Local development: delete from local filesystem
      if (fs.existsSync(gcsPath)) {
        fs.unlinkSync(gcsPath);
      }
    } else {
      // Production: delete from Google Cloud Storage
      if (!bucket) {
        throw new Error('Google Cloud Storage not configured');
      }
      const file = bucket.file(gcsPath);
      await file.delete();
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

export const getSignedUrl = async (
  gcsPath: string,
  action: 'read' | 'write' = 'read',
  expires: Date = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
): Promise<string> => {
  try {
    if (isLocalDev) {
      // Local development: return local file URL
      const filename = path.basename(gcsPath);
      return `http://localhost:${process.env.PORT || 3001}/files/download/${filename}`;
    } else {
      // Production: use Google Cloud Storage signed URL
      if (!bucket) {
        throw new Error('Google Cloud Storage not configured');
      }
      const file = bucket.file(gcsPath);
      const [signedUrl] = await file.getSignedUrl({
        action,
        expires,
      });
      return signedUrl;
    }
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

export const downloadFile = async (gcsPath: string): Promise<Buffer> => {
  try {
    if (isLocalDev) {
      // Local development: read from local filesystem
      return fs.readFileSync(gcsPath);
    } else {
      // Production: download from Google Cloud Storage
      if (!bucket) {
        throw new Error('Google Cloud Storage not configured');
      }
      const file = bucket.file(gcsPath);
      const [buffer] = await file.download();
      return buffer;
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};
