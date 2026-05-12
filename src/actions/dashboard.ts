"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  
  const [
    revenueData,
    ordersCount,
    activeProducts,
    lowStockVariants,
    statusDistribution,
    recentRevenue,
    recentOrders,
    topProducts
  ] = await Promise.all([
    // 1. Total Revenue
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    
    // 2. Orders Count (Total)
    prisma.order.count(),
    
    // 3. Active Products
    prisma.product.count({
      where: { status: "PUBLISHED" }
    }),
    
    // 4. Low Stock Variants
    prisma.productVariant.count({
      where: {
        stockQty: { lte: 5 } // Using 5 as a generic threshold for the dashboard stat
      }
    }),
    
    // 5. Status Distribution
    prisma.order.groupBy({
      by: ['status'],
      _count: true
    }),

    // 6. Revenue for last 7 days
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    }),

    // 7. Recent Orders (Top 5)
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } }
    }),

    // 8. Top Selling Products (Aggregated from OrderItems)
    prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: {
        quantity: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })
  ]);

  // ... (Process revenueByDay logic)

  const revenueByDay: Record<string, number> = {};
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = days[d.getDay()];
    revenueByDay[dayLabel] = 0;
  }

  recentRevenue.forEach(order => {
    const dayLabel = days[new Date(order.createdAt).getDay()];
    if (revenueByDay[dayLabel] !== undefined) {
      revenueByDay[dayLabel] += order.total;
    }
  });

  const chartLabels = Object.keys(revenueByDay);
  const chartValues = Object.values(revenueByDay);

  return {
    totalRevenue: revenueData._sum.total || 0,
    ordersCount,
    activeProducts,
    lowStockCount: lowStockVariants,
    statusDistribution: statusDistribution.map(s => ({
      status: s.status,
      count: s._count
    })),
    revenueChart: {
      labels: chartLabels,
      values: chartValues
    },
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer.name,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt
    })),
    topProducts: topProducts.map(p => ({
      name: p.productName,
      sales: p._sum.quantity || 0,
      revenue: p._sum.subtotal || 0
    }))
  };
}

