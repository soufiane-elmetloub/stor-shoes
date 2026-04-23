import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getStats(@Query('days') days: string = '30') {
    return this.analyticsService.getStats(parseInt(days));
  }

  @Get('utm-sources')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUtmSources(@Query('days') days: string = '30') {
    return this.analyticsService.getUtmSources(parseInt(days));
  }

  @Get('top-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTopProducts(@Query('limit') limit: string = '10') {
    return this.analyticsService.getTopProducts(parseInt(limit));
  }

  @Post('track-visit')
  async trackVisit(@Body() data: {
    page: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    productId?: string;
    referrer?: string;
  }) {
    return this.analyticsService.trackVisit(data);
  }

  @Post('track-conversion')
  async trackConversion(@Body() data: {
    orderId: string;
    utmSource?: string;
    value: number;
  }) {
    return this.analyticsService.trackConversion(data);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTodayStats() {
    return this.analyticsService.getTodayStats();
  }
}
