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

    const successful: string[] = [];
    const failed: { name: string; reason: string }[] = [];

    // Process each product group with isolated transaction
    for (const [productName, variants] of productsMap.entries()) {
      try {
        // Isolated transaction with 15-second timeout
        await prisma.$transaction(
          async (tx) => {
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
          },
          {
            timeout: 15000 // 15-second timeout per product
          }
        );

        successful.push(productName);
      } catch (err: any) {
        const errorReason = err?.message || "Unknown error during import";
        console.error(`Error importing product ${productName}:`, err);
        failed.push({
          name: productName,
          reason: errorReason
        });
      }
    }

    revalidatePath("/products");
    return {
      success: true,
      successful,
      failed,
      summary: {
        totalProcessed: productsMap.size,
        successCount: successful.length,
        failureCount: failed.length
      }
    };
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return {
      error: "Failed to process bulk import.",
      successful: [],
      failed: []
    };
  }
}
