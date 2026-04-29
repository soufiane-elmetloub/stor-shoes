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
    const startDay = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
    const endDay = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate());
    const dailySales = this.getDailySales(orders, startDay, endDay);

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

  private getDailySales(orders: any[], startDay: Date, endDay: Date) {
    const days = Math.round((endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    
    const result: { date: string; revenue: number; orders: number }[] = [];
    const salesMap = new Map<string, { revenue: number; orders: number }>();
    
    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const dateKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
      const current = salesMap.get(dateKey) || { revenue: 0, orders: 0 };
      current.revenue += Number(order.total);
      current.orders += 1;
      salesMap.set(dateKey, current);
    }

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDay);
      dayStart.setDate(startDay.getDate() + i);
      
      const dateKey = `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, '0')}-${String(dayStart.getDate()).padStart(2, '0')}`;
      const stats = salesMap.get(dateKey) || { revenue: 0, orders: 0 };

      result.push({
        date: dateKey,
        revenue: stats.revenue,
        orders: stats.orders,
      });
    }
    return result;
  }

  private async getSalesChart(days: number) {
    const endDay = new Date();
    const startDay = new Date();
    startDay.setDate(startDay.getDate() - days + 1);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDay },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, total: true },
    });

    return this.getDailySales(orders, startDay, endDay);
  }
}
