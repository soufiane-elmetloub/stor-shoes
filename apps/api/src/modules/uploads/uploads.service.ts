import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir: string;
  private readonly useCloudinary: boolean;

  constructor(private configService: ConfigService) {
    // Local directory configuration (fallback)
    this.uploadDir = this.configService.get<string>('UPLOADS_PATH')
      ? path.resolve(this.configService.get<string>('UPLOADS_PATH')!)
      : path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Configure Cloudinary if credentials are provided
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
      this.logger.log('✅ Cloudinary configured — images will be stored persistently on Cloudinary.');
    } else {
      this.logger.warn('⚠️  Cloudinary credentials not set — falling back to LOCAL storage. Images will be lost on Railway restarts!');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (this.useCloudinary) {
      return this.uploadToCloudinary(file);
    }

    return this.uploadToLocal(file);
  }

  /**
   * Upload to Cloudinary — returns a permanent HTTPS URL.
   */
  private uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'storshoes/products',
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(new BadRequestException('فشل رفع الصورة إلى Cloudinary'));
          }
          this.logger.log(`📸 Image uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload to local disk — returns a relative /uploads/... path.
   * WARNING: Not persistent on Railway/ephemeral filesystems.
   */
  private async uploadToLocal(file: Express.Multer.File): Promise<string> {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}${ext}`;
    const filepath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    this.logger.warn(`⚠️  Image saved locally (ephemeral): /uploads/${filename}`);
    return `/uploads/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (fileUrl.startsWith('https://res.cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/storshoes/products/abc123.webp
      // public_id = storshoes/products/abc123
      try {
        const matches = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
        if (matches && matches[1]) {
          await cloudinary.uploader.destroy(matches[1]);
          this.logger.log(`🗑️  Cloudinary image deleted: ${matches[1]}`);
        }
      } catch (err) {
        this.logger.error('Failed to delete image from Cloudinary', err);
      }
      return;
    }

    // Local file fallback
    const filepath = path.join(this.uploadDir, path.basename(fileUrl));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}
