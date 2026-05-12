"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function getShippingZones() {
  const session = await verifySession();
  if (!session.isAuth) return [];

  return await prisma.shippingZone.findMany({
    include: { regions: true },
    orderBy: { name: 'asc' }
  });
}

export async function createShippingZone(formData: FormData) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const flatRate = parseFloat(formData.get("flatRate") as string);
  const freeThreshold = formData.get("freeThreshold") ? parseFloat(formData.get("freeThreshold") as string) : null;
  const codEnabled = formData.get("codEnabled") === "on";
  const isDefault = formData.get("isDefault") === "on";
  const regionsRaw = formData.get("regions") as string;

  const regions = regionsRaw.split(",").map(r => r.trim()).filter(Boolean);

  try {
    await prisma.$transaction(async (tx) => {
      if (isDefault) {
        // Unset any existing default zone
        await tx.shippingZone.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      await tx.shippingZone.create({
        data: {
          name,
          flatRate,
          freeThreshold,
          codEnabled,
          isDefault,
          regions: {
            create: regions.map(r => ({ regionName: r }))
          }
        }
      });
    });

    revalidatePath("/settings/shipping");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create shipping zone." };
  }
}

export async function deleteShippingZone(id: string) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  try {
    const zone = await prisma.shippingZone.findUnique({ where: { id } });
    if (zone?.isDefault) {
      return { error: "You cannot delete the default shipping zone. Please assign another zone as default first." };
    }

    await prisma.shippingZoneRegion.deleteMany({ where: { zoneId: id } });
    await prisma.shippingZone.delete({ where: { id } });

    revalidatePath("/settings/shipping");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete shipping zone." };
  }
}


export async function updateShippingZone(id: string, formData: FormData) {

  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const flatRate = parseFloat(formData.get("flatRate") as string);
  const freeThreshold = formData.get("freeThreshold") ? parseFloat(formData.get("freeThreshold") as string) : null;
  const codEnabled = formData.get("codEnabled") === "on";
  const isDefault = formData.get("isDefault") === "on";
  const regionsRaw = formData.get("regions") as string;

  const regions = regionsRaw.split(",").map(r => r.trim()).filter(Boolean);

  try {
    await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.shippingZone.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      await tx.shippingZoneRegion.deleteMany({ where: { zoneId: id } });
      await tx.shippingZone.update({
        where: { id },
        data: {
          name,
          flatRate,
          freeThreshold,
          codEnabled,
          isDefault,
          regions: {
            create: regions.map(r => ({ regionName: r }))
          }
        }
      });
    });

    revalidatePath("/settings/shipping");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update shipping zone." };
  }
}


