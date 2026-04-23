import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalVisits,
      uniqueVisitors,
      totalConversions,
      todayVisits,
    ] = await Promise.all([
      // Total visits in period
      this.prisma.visit.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Unique visitors (by sessionId)
      this.prisma.visit.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: startDate } },
        _count: { sessionId: true },
      }).then(result => result.length),
      // Total conversions in period
      this.prisma.conversion.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Today's visits
      this.prisma.visit.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const conversionRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;

    return {
      totalVisits,
      uniqueVisitors,
      todayVisits,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalConversions,
    };
  }

  async getUtmSources(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const utmData = await this.prisma.visit.groupBy({
      by: ['utmSource', 'utmMedium'],
      where: {
        createdAt: { gte: startDate },
        utmSource: { not: null },
      },
      _count: { id: true },
    });

    const conversions = await this.prisma.conversion.groupBy({
      by: ['utmSource'],
      where: {
        createdAt: { gte: startDate },
        utmSource: { not: null },
      },
      _count: { id: true },
    });

    return utmData.map((item) => {
      const conv = conversions.find(c => c.utmSource === item.utmSource);
      const clicks = item._count.id;
      const convCount = conv?._count.id || 0;
      const rate = clicks > 0 ? (convCount / clicks) * 100 : 0;

      return {
        source: item.utmSource || 'unknown',
        medium: item.utmMedium || 'unknown',
        clicks,
        conversions: convCount,
        conversionRate: parseFloat(rate.toFixed(1)),
      };
    });
  }

  async getTopProducts(limit: number = 10) {
    const products = await this.prisma.product.findMany({
      take: limit,
      orderBy: { viewCount: 'desc' },
      include: {
        images: { take: 1 },
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    return products.map((product) => {
      const purchases = product.orderItems.filter(
        item => item.order.status !== 'CANCELLED'
      ).length;
      const views = product.viewCount;
      const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

      return {
        productId: product.id,
        productName: product.nameAr || product.name,
        views,
        purchases,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        image: product.images[0]?.url || null,
      };
    });
  }

  async trackVisit(data: {
    page: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    productId?: string;
    referrer?: string;
  }) {
    return this.prisma.visit.create({
      data: {
        page: data.page,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        productId: data.productId,
        referrer: data.referrer,
      },
    });
  }

  async trackConversion(data: {
    orderId: string;
    utmSource?: string;
    value: number;
  }) {
    return this.prisma.conversion.create({
      data: {
        orderId: data.orderId,
        utmSource: data.utmSource,
        value: data.value,
      },
    });
  }

  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [visits, conversions] = await Promise.all([
      this.prisma.visit.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.conversion.count({
        where: { createdAt: { gte: today } },
      }),
    ]);

    return {
      visits,
      conversions,
      conversionRate: visits > 0 ? ((conversions / visits) * 100).toFixed(2) : '0',
    };
  }
}
