"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name) return { error: "Name is required" };

  try {
    await prisma.category.create({
      data: {
        name,
      }
    });
    
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create category" };
  }
}

export async function renameCategory(id: string, newName: string) {
  if (!newName || newName.trim() === "") return { error: "Name is required" };

  try {
    await prisma.category.update({
      where: { id },
      data: { name: newName.trim() }
    });
    
    revalidatePath("/categories");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "A category with this name already exists." };
    }
    return { error: "Failed to rename category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Spec: A category cannot be deleted if products are still assigned to it
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) return { error: "Category not found" };
    
    if (category._count.products > 0) {
      return { error: `Cannot delete: ${category._count.products} products are assigned to this category.` };
    }

    await prisma.category.delete({
      where: { id }
    });
    
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete category" };
  }
}