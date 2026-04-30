import { Controller, Post, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Get('debug')
  @ApiOperation({ summary: 'Debug uploads directory' })
  debugUploads() {
    const uploadDir = (this.uploadsService as any).uploadDir;
    let files = [];
    try {
      if (fs.existsSync(uploadDir)) {
        files = fs.readdirSync(uploadDir);
      }
    } catch (e) {}
    
    return {
      cwd: process.cwd(),
      uploadDir,
      envUploadsPath: process.env.UPLOADS_PATH,
      exists: fs.existsSync(uploadDir),
      filesCount: files.length,
      files: files.slice(-10), // last 10 files
    };
  }

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'رفع صورة' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadsService.saveFile(file);
    return { url };
  }
}
