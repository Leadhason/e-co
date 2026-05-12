"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function getCustomers(search?: string) {
  return await prisma.customer.findMany({
    where: {
      OR: search ? [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ] : undefined,
    },
    include: {
      _count: {
        select: { orders: true },
      },
      orders: {
        select: { total: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomer(id: string) {
  return await prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { items: true } }
        }
      },
    },
  });
}

export async function toggleCustomerBlock(
  id: string, 
  isBlocked: boolean, 
  reason?: string
) {
  try {
    const session = await verifySession();
    if (!session.isAuth) return { error: "Unauthorized" };

    await prisma.customer.update({
      where: { id },
      data: {
        isBlocked,
        blockReason: isBlocked ? reason : null,
        blockedAt: isBlocked ? new Date() : null,
      },
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update customer status" };
  }
}
