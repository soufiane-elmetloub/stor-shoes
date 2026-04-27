import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    // Local fallback directory
    this.uploadDir = this.configService.get<string>('UPLOADS_PATH')
      ? path.resolve(this.configService.get<string>('UPLOADS_PATH')!)
      : path.join(process.cwd(), '..', '..', 'uploads');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    return this.uploadToLocal(file);
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
    // Local file
    const filepath = path.join(this.uploadDir, path.basename(fileUrl));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}
