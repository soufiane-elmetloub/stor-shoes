import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'إحصائيات لوحة التحكم' })
  getOverview() {
    return this.reportsService.getOverview();
  }

  @Get('sales')
  @ApiOperation({ summary: 'تقرير المبيعات' })
  getSalesReport(
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getSalesReport({ period, dateFrom, dateTo });
  }
}
