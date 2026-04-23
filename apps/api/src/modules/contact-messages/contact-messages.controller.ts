import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactMessagesService } from './contact-messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactStatus } from '@prisma/client';

@ApiTags('Contact Messages')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private contactMessagesService: ContactMessagesService) {}

  @Post()
  @ApiOperation({ summary: 'إرسال رسالة جديدة (Public)' })
  async create(
    @Body() dto: { name: string; email: string; phone?: string; subject?: string; message: string },
  ) {
    const message = await this.contactMessagesService.create(dto);
    return {
      success: true,
      message: 'Message envoyé avec succès',
      data: message,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'قائمة رسائل العملاء (Admin)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ContactStatus,
    @Query('search') search?: string,
  ) {
    return this.contactMessagesService.findAll({ page, limit, status, search });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إحصائيات الرسائل (Admin)' })
  async getStats() {
    const stats = await this.contactMessagesService.getStats();
    return { success: true, data: stats };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تفاصيل الرسالة' })
  async findById(@Param('id') id: string) {
    const message = await this.contactMessagesService.findById(id);
    if (!message) {
      return { success: false, message: 'Message non trouvé' };
    }
    return { success: true, data: message };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث حالة الرسالة' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ContactStatus },
  ) {
    const message = await this.contactMessagesService.updateStatus(id, body.status);
    return { success: true, data: message };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف الرسالة' })
  async delete(@Param('id') id: string) {
    await this.contactMessagesService.delete(id);
    return { success: true, message: 'Message supprimé' };
  }
}
