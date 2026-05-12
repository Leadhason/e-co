"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";
import { OrderStatus } from "@prisma/client";

export async function getOrders(status?: OrderStatus, search?: string) {
  return await prisma.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { customer: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: {
      customer: {
        select: { name: true, email: true },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      address: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      },
      statusLogs: {
        include: {
          admin: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      notes: {
        include: {
          admin: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
      },

      refunds: true,
    },
  });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminId: string
) {
  try {
    const session = await verifySession();
    if (!session.isAuth) return { error: "Unauthorized" };

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found");
      if (order.status === newStatus) return { success: true };

      // Security/Business Rule: Only allowed if the order has not been shipped
      if (newStatus === "CANCELLED" && (order.status === "SHIPPED" || order.status === "DELIVERED")) {
        return { error: "Cannot cancel an order that has already been shipped or delivered." };
      }

      // Logic: Return stock to inventory if moving TO Cancelled
      if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQty: { increment: item.quantity } },
            });
          }
        }
      }

      // Logic: Deduct stock if restoring a Cancelled order
      if (order.status === "CANCELLED" && newStatus !== "CANCELLED") {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQty: { decrement: item.quantity } },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId,
          status: newStatus,
          adminId,
        },
      });

      return { success: true };
    });

    if (result.error) return result;

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update order status" };
  }
}


export async function addOrderNote(orderId: string, note: string) {
  try {
    const session = await verifySession();
    if (!session.isAuth || !session.userId) return { error: "Unauthorized" };

    await prisma.orderNote.create({
      data: {
        orderId,
        note,
        adminId: session.userId,
      },
    });

    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add note" };
  }
}

