import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly useCloudinary: boolean;
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.useCloudinary = !!(cloudName && apiKey && apiSecret);

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.logger.log('☁️  Cloudinary configured — images will be uploaded to the cloud');
    } else {
      this.logger.warn('⚠️  Cloudinary not configured — falling back to local disk storage');
    }

    // Local fallback directory
    this.uploadDir = this.configService.get<string>('UPLOADS_PATH')
      ? path.resolve(this.configService.get<string>('UPLOADS_PATH')!)
      : path.join(process.cwd(), '..', '..', 'uploads');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (this.useCloudinary) {
      return this.uploadToCloudinary(file);
    }
    return this.uploadToLocal(file);
  }

  /**
   * Upload to Cloudinary — returns a full HTTPS URL.
   * Images are auto-optimized (WebP, quality, CDN).
   */
  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'storshoes',
          resource_type: 'image',
          format: 'webp',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' }, // cap max width
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error);
            reject(error || new Error('No result from Cloudinary'));
            return;
          }
          this.logger.log(`☁️  Uploaded: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Upload to local disk — returns a relative /uploads/... path.
   * Used for local development when Cloudinary is not configured.
   */
  private async uploadToLocal(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const filepath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    return `/uploads/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (fileUrl.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/xxx/image/upload/v123/storshoes/filename.webp
      try {
        const parts = fileUrl.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
        this.logger.log(`☁️  Deleted from Cloudinary: ${publicId}`);
      } catch (err) {
        this.logger.error('Failed to delete from Cloudinary', err);
      }
    } else {
      // Local file
      const filepath = path.join(this.uploadDir, path.basename(fileUrl));
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }
}
