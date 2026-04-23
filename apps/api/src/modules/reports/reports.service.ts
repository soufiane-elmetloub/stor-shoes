import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      todayOrders,
      allOrders,
      todayOrdersList,
      recentOrders,
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.customer.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.productVariant.count({ where: { stock: { lte: 3 }, isActive: true } }),
      this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: { include: { product: true } } },
      }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const todayRevenue = todayOrdersList.reduce((sum, o) => sum + Number(o.total), 0);

    // Sales chart (last 30 days)
    const salesChart = await this.getSalesChart(30);

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      todayOrders,
      todayRevenue,
      recentOrders,
      salesChart,
    };
  }

  async getSalesReport(query: { period?: 'daily' | 'weekly' | 'monthly'; dateFrom?: string; dateTo?: string }) {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productSales = new Map<string, { id: string; name: string; imageUrl: string | null; quantity: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const existing = productSales.get(item.productId) || {
          id: item.productId,
          name: item.product.name,
          imageUrl: item.product.images?.[0]?.url || null,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.price) * item.quantity;
        productSales.set(item.productId, existing);
      }
    }
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category
    const categorySales = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        const catName = item.product.category?.name || 'غير مصنف';
        categorySales.set(catName, (categorySales.get(catName) || 0) + Number(item.price) * item.quantity);
      }
    }
    const salesByCategory = Array.from(categorySales.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Payment methods
    const paymentMap = new Map<string, { count: number; amount: number }>();
    for (const order of orders) {
      const method = 'COD'; // Default to COD as paymentMethod doesn't exist on Order model yet
      const existing = paymentMap.get(method) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += Number(order.total);
      paymentMap.set(method, existing);
    }
    const paymentMethods = Array.from(paymentMap.entries())
      .map(([method, data]) => ({ method, count: data.count, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount);

    // Daily sales for chart
    const dailySales = await this.getDailySales(dateFrom, dateTo);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      salesByCategory,
      paymentMethods,
      dailySales,
      orders: orders.slice(0, 50), // Limit orders in response
    };
  }

  private async getDailySales(dateFrom: Date, dateTo: Date) {
    const days = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (24 * 60 * 60 * 1000));
    const result: { date: string; revenue: number; orders: number }[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(dateFrom);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = await this.prisma.order.findMany({
        where: { createdAt: { gte: dayStart, lt: dayEnd }, status: { not: 'CANCELLED' } },
        select: { total: true },
      });

      result.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        orders: dayOrders.length,
      });
    }
    return result;
  }

  private async getSalesChart(days: number) {
    const result: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = await this.prisma.order.findMany({
        where: { createdAt: { gte: dayStart, lt: dayEnd }, status: { not: 'CANCELLED' } },
        select: { total: true },
      });

      result.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        orders: dayOrders.length,
      });
    }
    return result;
  }
}
