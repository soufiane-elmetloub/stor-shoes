import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir: string;
  private readonly isCloudinaryConfigured: boolean;

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isCloudinaryConfigured = true;
      this.logger.log('Cloudinary is configured and ready to use.');
    } else {
      this.isCloudinaryConfigured = false;
      this.logger.warn('Cloudinary configuration is missing. Falling back to local storage.');
    }

    // Local fallback directory
    this.uploadDir = this.configService.get<string>('UPLOADS_PATH')
      ? path.resolve(this.configService.get<string>('UPLOADS_PATH')!)
      : path.join(process.cwd(), '..', '..', 'uploads');

    if (!this.isCloudinaryConfigured && !fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (this.isCloudinaryConfigured) {
      return this.uploadToCloudinary(file);
    }
    return this.uploadToLocal(file);
  }

  /**
   * Upload to Cloudinary
   */
  private uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'storshoes_products',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Failed to upload image to Cloudinary', error);
            return reject(error);
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload to local disk — returns a relative /uploads/... path.
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
      try {
        const urlParts = fileUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        this.logger.log(`Deleted image from Cloudinary: ${publicId}`);
      } catch (error) {
        this.logger.error(`Failed to delete image from Cloudinary: ${fileUrl}`, error);
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
