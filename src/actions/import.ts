"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type ImportRow = {
  name: string;
  sku: string;
  category: string;
  description: string;
  basePrice: number;
  attributes: Record<string, string>;
};

export async function importProductsAction(rows: ImportRow[]) {
  try {
    const session = await verifySession();
    if (!session.isAuth) return { error: "Unauthorized" };

    // Group items by Product Name
    const productsMap = new Map<string, ImportRow[]>();
    for (const row of rows) {
      if (!productsMap.has(row.name)) {
        productsMap.set(row.name, []);
      }
      productsMap.get(row.name)!.push(row);
    }

    const results = {
      created: 0,
      updated: 0,
      errors: 0
    };

    // Process each product group
    for (const [productName, variants] of productsMap.entries()) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Resolve Category
          const categoryName = variants[0].category || "Uncategorized";
          let category = await tx.category.findFirst({
            where: { name: { equals: categoryName, mode: "insensitive" } }
          });

          if (!category) {
            category = await tx.category.create({
              data: { name: categoryName, slug: categoryName.toLowerCase().replace(/\s+/g, '-') }
            });
          }

          // 2. Resolve Product
          let product = await tx.product.findFirst({
            where: { name: { equals: productName, mode: "insensitive" } }
          });

          if (!product) {
            product = await tx.product.create({
              data: {
                name: productName,
                description: variants[0].description,
                basePrice: variants[0].basePrice,
                categoryId: category.id,
                status: "DRAFT"
              }
            });
            results.created++;
          } else {
            // Update base info if needed
            await tx.product.update({
              where: { id: product.id },
              data: {
                description: variants[0].description,
                basePrice: variants[0].basePrice,
                categoryId: category.id
              }
            });
            results.updated++;
          }

          // 3. Resolve Attributes for this product
          // We look at all keys in the 'attributes' object across all variants in this group
          const attributeNames = Array.from(new Set(variants.flatMap(v => Object.keys(v.attributes))));
          const attrRecord: Record<string, any> = {};

          for (const attrName of attributeNames) {
            let attr = await tx.variantAttribute.findFirst({
              where: { productId: product.id, name: { equals: attrName, mode: "insensitive" } }
            });

            if (!attr) {
              attr = await tx.variantAttribute.create({
                data: { productId: product.id, name: attrName }
              });
            }
            attrRecord[attrName] = attr;
          }

          // 4. Process each Variant
          for (const vData of variants) {
            // Find/Create Option for each attribute
            const optionIds: string[] = [];
            for (const [key, val] of Object.entries(vData.attributes)) {
              const attr = attrRecord[key];
              let option = await tx.attributeOption.findFirst({
                where: { attributeId: attr.id, value: { equals: val, mode: "insensitive" } }
              });

              if (!option) {
                option = await tx.attributeOption.create({
                  data: { attributeId: attr.id, value: val }
                });
              }
              optionIds.push(option.id);
            }

            // Upsert Variant by SKU
            const variant = await tx.productVariant.upsert({
              where: { sku: vData.sku },
              create: {
                productId: product!.id,
                sku: vData.sku,
                stockQty: 0,
                isActive: true
              },
              update: {
                productId: product!.id
              }
            });

            // Re-sync option maps for this variant
            // Delete existing and recreate (simplest way to sync)
            await tx.variantOptionMap.deleteMany({ where: { variantId: variant.id } });
            for (const oId of optionIds) {
              await tx.variantOptionMap.create({
                data: { variantId: variant.id, optionId: oId }
              });
            }
          }
        });
      } catch (err) {
        console.error(`Error importing product ${productName}:`, err);
        results.errors++;
      }
    }

    revalidatePath("/products");
    return { success: true, results };
  } catch (error) {
    console.error("Bulk import error:", error);
    return { error: "Failed to process bulk import." };
  }
}
