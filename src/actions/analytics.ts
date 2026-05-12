"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { OrderStatus } from "@prisma/client";

// Helper to get date ranges
function getDateRange(range: string) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7days":
      start.setDate(now.getDate() - 7);
      break;
    case "30days":
      start.setDate(now.getDate() - 30);
      break;
    case "3months":
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  // Calculate previous period for comparison
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - duration);

  return { start, end, prevStart, prevEnd };
}

export async function getSalesReport(range: string = "7days") {
  const session = await verifySession();
  if (!session.isAuth || session.role !== "OWNER") {
    throw new Error("Unauthorized");
  }

  const { start, end, prevStart, prevEnd } = getDateRange(range);

  const [currentSales, prevSales, categoryBreakdown, paymentBreakdown, chartData] = await Promise.all([
    // Current period metrics
    prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" }
      },
      _sum: { total: true },
      _count: { id: true }
    }),
    // Previous period metrics for comparison
    prisma.order.aggregate({
      where: {
        createdAt: { gte: prevStart, lte: prevEnd },
        status: { not: "CANCELLED" }
      },
      _sum: { total: true },
      _count: { id: true }
    }),
    // Breakdown by Category
    prisma.orderItem.groupBy({
      by: ['productName'], // Simplified: should ideally join with Category
      _sum: { subtotal: true, quantity: true },
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: { not: "CANCELLED" }
        }
      },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 10
    }),
    // Breakdown by Payment Method
    prisma.order.groupBy({
      by: ['paymentMethod'],
      _sum: { total: true },
      _count: { id: true },
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" }
      }
    }),
    // Line Chart Data
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" }
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  return {
    metrics: {
      revenue: currentSales._sum.total || 0,
      prevRevenue: prevSales._sum.total || 0,
      orders: currentSales._count.id || 0,
      prevOrders: prevSales._count.id || 0,
      aov: currentSales._count.id > 0 ? (currentSales._sum.total || 0) / currentSales._count.id : 0
    },
    categoryBreakdown,
    paymentBreakdown,
    chartData
  };
}

export async function getProductsReport(range: string = "30days") {
  const session = await verifySession();
  if (!session.isAuth || session.role !== "OWNER") throw new Error("Unauthorized");

  const { start, end } = getDateRange(range);

  const [topSellers, worstSellers, mostRefunded, stockSummary] = await Promise.all([
    // Top Sellers
    prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, subtotal: true },
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: { not: "CANCELLED" }
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    }),
    // Worst Sellers (Low Sales)
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        NOT: {
          variants: {
            some: {
              orderItems: {
                some: {
                  order: { createdAt: { gte: start, lte: end } }
                }
              }
            }
          }
        }
      },
      select: { name: true, basePrice: true },
      take: 5
    }),
    // Most Refunded
    prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true },
      where: {
        order: {
          status: "REFUNDED",
          createdAt: { gte: start, lte: end }
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    // Stock levels
    prisma.productVariant.groupBy({
      by: ['isActive'],
      _count: { id: true },
      _sum: { stockQty: true }
    })
  ]);

  // Aggregate stock levels manually for clarity
  const variants = await prisma.productVariant.findMany({
    select: { stockQty: true, lowStockThreshold: true }
  });

  const stockStats = {
    total: variants.length,
    inStock: variants.filter(v => v.stockQty > v.lowStockThreshold).length,
    lowStock: variants.filter(v => v.stockQty <= v.lowStockThreshold && v.stockQty > 0).length,
    outOfStock: variants.filter(v => v.stockQty <= 0).length
  };

  return { topSellers, worstSellers, mostRefunded, stockStats };
}

export async function getOrdersReport(range: string = "30days") {
  const session = await verifySession();
  if (!session.isAuth || session.role !== "OWNER") throw new Error("Unauthorized");

  const { start, end } = getDateRange(range);

  const [statusBreakdown, orders] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { createdAt: { gte: start, lte: end } }
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ["SHIPPED", "DELIVERED"] }
      },
      select: { createdAt: true, statusLogs: { where: { status: "SHIPPED" }, take: 1, select: { createdAt: true } } }
    })
  ]);

  // Calculate avg fulfilment time (simplified)
  let totalFulfilmentTime = 0;
  let count = 0;
  orders.forEach(o => {
    if (o.statusLogs.length > 0) {
      const duration = o.statusLogs[0].createdAt.getTime() - o.createdAt.getTime();
      totalFulfilmentTime += duration;
      count++;
    }
  });

  const avgFulfilmentHours = count > 0 ? (totalFulfilmentTime / count) / (1000 * 60 * 60) : 0;

  return { statusBreakdown, avgFulfilmentHours };
}

export async function getCustomersReport(range: string = "30days") {
  const session = await verifySession();
  if (!session.isAuth || session.role !== "OWNER") throw new Error("Unauthorized");

  const { start, end } = getDateRange(range);

  const [totalCustomers, newCustomers, topCustomers, chartData] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.customer.findMany({
      select: {
        name: true,
        email: true,
        _count: { select: { orders: true } },
        orders: { select: { total: true } }
      },
      take: 10
    }),
    prisma.customer.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  const topCustomersFormatted = topCustomers.map(c => ({
    name: c.name,
    email: c.email,
    orders: c._count.orders,
    totalSpent: c.orders.reduce((acc, curr) => acc + curr.total, 0)
  })).sort((a, b) => b.totalSpent - a.totalSpent);

  return { totalCustomers, newCustomers, topCustomers: topCustomersFormatted, chartData };
}
