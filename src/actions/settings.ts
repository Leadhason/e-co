"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";
import bcrypt from "bcryptjs";

import { supabaseAdmin } from "@/lib/supabase";

export async function getStoreSettings() {
  let settings = await prisma.storeSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        name: "StoneBase Store",
        currency: "GHS",
        contactEmail: "admin@stonebase.com",
      }
    });
  }
  
  return settings;
}

export async function updateStoreSettings(formData: FormData) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const address = formData.get("address") as string;
  const currency = formData.get("currency") as string;
  const timezone = formData.get("timezone") as string;
  const logoFile = formData.get("logoFile") as File;

  let logoUrl = formData.get("logoUrl") as string;

  // Handle new logo upload
  if (logoFile && logoFile.size > 0) {
    const fileName = `logo_${Date.now()}.${logoFile.name.split('.').pop()}`;
    const { data, error } = await supabaseAdmin.storage
      .from("store-assets")
      .upload(fileName, logoFile, { upsert: true });
    
    if (data) {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("store-assets")
        .getPublicUrl(fileName);
      logoUrl = publicUrl;
    }
  }

  const settings = await prisma.storeSettings.findFirst();
  
  if (settings) {
    await prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        name,
        contactEmail,
        contactPhone,
        address,
        currency,
        timezone,
        logoUrl: logoUrl || settings.logoUrl
      }
    });
  }

  revalidatePath("/settings");
  return { success: true };
}



export async function getAdminProfile() {
  const session = await verifySession();
  if (!session.isAuth) return null;

  return await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
}

export async function updateAdminProfile(formData: FormData) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "User not found" };

  const data: any = { name, email };

  if (newPassword && newPassword.trim().length >= 6) {
    // Check current password before allowing change
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return { error: "Current password incorrect." };
    
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  try {
    await prisma.adminUser.update({
      where: { id: session.userId },
      data
    });
    revalidatePath("/settings/team");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update profile. Email might already be in use." };
  }
}

export async function getAdminUsers() {
  const session = await verifySession();
  if (!session.isAuth) return [];

  const currentUser = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (currentUser?.role !== "OWNER") return [];

  return await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });
}

export async function updatePaymentSettings(formData: FormData) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const codEnabled = formData.get("codEnabled") === "on";

  const settings = await prisma.storeSettings.findFirst();
  if (settings) {
    await prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        codEnabled
      }
    });
  }

  revalidatePath("/settings/payments");
  return { success: true };
}

export async function createAdminUser(formData: FormData) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const currentUser = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (currentUser?.role !== "OWNER") return { error: "Only owners can create employees." };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "OWNER" | "EMPLOYEE";

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({
      data: { name, email, passwordHash, role }
    });
    revalidatePath("/settings/team");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create user. Email might already be in use." };
  }
}


export async function updateTaxSettings(formData: FormData) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const taxRate = parseFloat(formData.get("taxRate") as string);
  const taxInclusive = formData.get("taxInclusive") === "on";

  const settings = await prisma.storeSettings.findFirst();
  if (settings) {
    await prisma.storeSettings.update({
      where: { id: settings.id },
      data: { taxRate, taxInclusive }
    });
  }

  revalidatePath("/settings/tax");
  return { success: true };
}

export async function getNotificationSettings() {
  const session = await verifySession();
  if (!session.isAuth) return [];

  return await prisma.notificationSetting.findMany({
    orderBy: { event: 'asc' }
  });
}

export async function updateNotificationSetting(id: string, isEnabled: boolean, recipientEmail: string) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  await prisma.notificationSetting.update({
    where: { id },
    data: { isEnabled, recipientEmail }
  });

  revalidatePath("/settings/notifications");
  return { success: true };
}

export async function deleteAdminUser(id: string) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  // Prevent self-deletion
  if (session.userId === id) return { error: "You cannot delete your own account." };

  const currentUser = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (currentUser?.role !== "OWNER") return { error: "Only owners can delete accounts." };

  try {
    await prisma.adminUser.delete({ where: { id } });
    revalidatePath("/settings/team");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete user." };
  }
}

export async function exportData(type: "products" | "orders" | "customers") {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  try {
    let data: any[] = [];
    let headers: string[] = [];

    if (type === "products") {
      data = await prisma.product.findMany({ include: { category: true } });
      headers = ["ID", "Name", "Category", "Base Price", "Status", "Created At"];
      const csv = [
        headers.join(","),
        ...data.map(p => `"${p.id}","${p.name}","${p.category.name}",${p.basePrice},"${p.status}","${p.createdAt.toISOString()}"`)
      ].join("\n");
      return { success: true, csv, filename: `products_${new Date().toISOString().split('T')[0]}.csv` };
    }

    if (type === "orders") {
      data = await prisma.order.findMany({ include: { customer: true } });
      headers = ["Order #", "Customer", "Total", "Status", "Payment", "Date"];
      const csv = [
        headers.join(","),
        ...data.map(o => `"${o.orderNumber}","${o.customer.name}",${o.total},"${o.status}","${o.paymentStatus}","${o.createdAt.toISOString()}"`)
      ].join("\n");
      return { success: true, csv, filename: `orders_${new Date().toISOString().split('T')[0]}.csv` };
    }

    if (type === "customers") {
      data = await prisma.customer.findMany();
      headers = ["ID", "Name", "Email", "Phone", "Blocked", "Joined"];
      const csv = [
        headers.join(","),
        ...data.map(c => `"${c.id}","${c.name}","${c.email}","${c.phone || ''}",${c.isBlocked},"${c.createdAt.toISOString()}"`)
      ].join("\n");
      return { success: true, csv, filename: `customers_${new Date().toISOString().split('T')[0]}.csv` };
    }

    return { error: "Invalid export type" };
  } catch (error) {
    return { error: "Failed to generate export." };
  }
}

export async function updateAdminStatus(id: string, isBlocked: boolean) {
  const session = await verifySession();
  if (!session.isAuth) return { error: "Unauthorized" };

  const currentUser = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (currentUser?.role !== "OWNER") return { error: "Only owners can manage staff status." };

  // Prevent self-blocking
  if (session.userId === id) return { error: "You cannot block your own account." };

  try {
    await prisma.adminUser.update({
      where: { id },
      data: { isBlocked }
    });
    revalidatePath("/settings/team");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update staff status." };
  }
}



