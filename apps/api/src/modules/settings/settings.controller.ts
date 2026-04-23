import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  // In-memory storage for settings (can be replaced with database later)
  private siteSettings: Record<string, any> = {};

  @Get('site')
  @ApiOperation({ summary: 'Get site settings' })
  getSettings() {
    return this.siteSettings;
  }

  @Put('site')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update site settings' })
  updateSettings(@Body() settings: Record<string, any>) {
    this.siteSettings = { ...this.siteSettings, ...settings };
    return { success: true, settings: this.siteSettings };
  }
}
