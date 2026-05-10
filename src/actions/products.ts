"use server";

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function createProduct(prevState: any, formData: FormData) {
  const uploadedUrls: string[] = [];
  const uploadedFileNames: string[] = []; // Track filenames for cleanup if DB fails

  try {
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
      return { error: "Unauthorized. Please log in." };
    }

    const productId = formData.get("productId") as string | null;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0;
    const status = (formData.get("status") as string) || "DRAFT";
    
    // Parse the hidden JSON strings from our Variant Builder
    const attributesData = JSON.parse(formData.get("attributesData") as string || "[]");
    const variantsData = JSON.parse(formData.get("variantsData") as string || "[]");

    const existingImageIds = JSON.parse(formData.get("existingImageIds") as string || "[]");
    const newImages = formData.getAll("newImages") as File[];


    for (const file of newImages) {
      if (file.size === 0) continue;
      
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      
      const { error } = await supabaseAdmin.storage
        .from("product-images")
        .upload(fileName, file, { upsert: true });
        
      if (error) {
        console.error("Supabase upload error:", error);
        continue;
      }
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(fileName);
        
      uploadedUrls.push(publicUrlData.publicUrl);
      uploadedFileNames.push(fileName);
    }

    // Perform operations in a Transaction ensuring all or nothing insert
    await prisma.$transaction(async (tx) => {
      if (productId) {
        await tx.product.update({
          where: { id: productId },
          data: { name, categoryId, description, basePrice, status: status as any }
        });

        // Sync Images
        const existingImages = await tx.productImage.findMany({ where: { productId }, orderBy: { position: 'asc' } });
        for (const img of existingImages) {
          if (!existingImageIds.includes(img.id)) {
            await tx.productImage.delete({ where: { id: img.id } });
            // remove from Supabase
            const fileName = img.url.split('/').pop();
            if (fileName) {
              await supabaseAdmin.storage.from("product-images").remove([fileName]);
            }
          }
        }
        
        let nextPosition = existingImages.length;
        for (const url of uploadedUrls) {
          await tx.productImage.create({
            data: { productId, url, position: nextPosition++ }
          });
        }

        // 2. Sync Attributes & Options
        const optionMap: Record<string, string> = {}; // "AttributeName:OptionValue" -> optionId
        const incomingAttributeNames = attributesData.map((a: any) => a.name).filter(Boolean);
        
        // Delete removed attributes & options first
        const existingAttributes = await tx.variantAttribute.findMany({
          where: { productId },
          include: { options: true }
        });
        
        for (const existingAttr of existingAttributes) {
          if (!incomingAttributeNames.includes(existingAttr.name)) {
            // Attribute removed entirely
            await tx.attributeOption.deleteMany({ where: { attributeId: existingAttr.id } });
            await tx.variantAttribute.delete({ where: { id: existingAttr.id } });
            continue;
          }
          // Attribute kept, check options
          const incomingAttr = attributesData.find((a: any) => a.name === existingAttr.name);
          const incomingOptions = incomingAttr?.options || [];
          for (const existingOpt of existingAttr.options) {
            if (!incomingOptions.includes(existingOpt.value)) {
              // Option removed, delete maps first to satisfy constraints
              await tx.variantOptionMap.deleteMany({ where: { optionId: existingOpt.id } });
              await tx.attributeOption.delete({ where: { id: existingOpt.id } });
            }
          }
        }

        // Upsert attributes and options
        for (const attr of attributesData) {
          if (!attr.name || attr.options.length === 0) continue;
          
          let dbAttr = await tx.variantAttribute.findFirst({
            where: { productId, name: attr.name }
          });
          if (!dbAttr) {
            dbAttr = await tx.variantAttribute.create({
              data: { productId, name: attr.name }
            });
          }

          for (const optVal of attr.options) {
            let dbOpt = await tx.attributeOption.findFirst({
              where: { attributeId: dbAttr.id, value: optVal }
            });
            if (!dbOpt) {
              dbOpt = await tx.attributeOption.create({
                data: { attributeId: dbAttr.id, value: optVal }
              });
            }
            optionMap[`${dbAttr.name}:${dbOpt.value}`] = dbOpt.id;
          }
        }

        // Sync Variants
        const incomingVariantIds = variantsData.filter((v: any) => !v.id.startsWith("0.")).map((v: any) => v.id);
        
        // Deactivate or Delete removed variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId }
        });
        
        for (const existingVariant of existingVariants) {
          if (!incomingVariantIds.includes(existingVariant.id)) {
            await tx.variantOptionMap.deleteMany({ where: { variantId: existingVariant.id } });
            try {
              await tx.productVariant.delete({ where: { id: existingVariant.id } });
            } catch (err) {
              // If delete fails due to relations (e.g. order history), soft delete
              await tx.productVariant.update({
                where: { id: existingVariant.id },
                data: { isActive: false }
              });
            }
          }
        }

        for (const variant of variantsData) {
          const incomingStockQty = Number(variant.stockQty) || 0;
          
          if (!variant.id.startsWith("0.")) {
            // Existing variant -> Update it
            const existingVar = existingVariants.find((v) => v.id === variant.id);
            const currentStockQty = existingVar?.stockQty || 0;

            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                priceOverride: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
                stockQty: incomingStockQty,
                isActive: variant.isActive
              }
            }).catch(() => {});

            if (incomingStockQty !== currentStockQty) {
              await tx.stockAdjustment.create({
                data: {
                  variantId: variant.id,
                  adminId: session.userId,
                  quantityChange: incomingStockQty - currentStockQty,
                  reason: "MANUAL_ADJUSTMENT"
                }
              });
            }
          } else {
            // New variant during update
            if (!variant.isActive) continue; 
            
            const resolvedSku = variant.sku || `${name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const dbVariant = await tx.productVariant.create({
              data: {
                productId,
                sku: resolvedSku,
                priceOverride: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
                stockQty: incomingStockQty,
                isActive: true,
              }
            });

            if (incomingStockQty > 0) {
              await tx.stockAdjustment.create({
                data: {
                  variantId: dbVariant.id,
                  adminId: session.userId,
                  quantityChange: incomingStockQty,
                  reason: "INITIAL_STOCK"
                }
              });
            }

            // Link options
            const optionKeys = Object.keys(variant.options || {});
            for (const attrName of optionKeys) {
              const optValue = variant.options[attrName];
              const optionId = optionMap[`${attrName}:${optValue}`];
              if (optionId) {
                await tx.variantOptionMap.create({
                  data: {
                    variantId: dbVariant.id,
                    optionId: optionId
                  }
                });
              }
            }
          }
        }
        return;
      }
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          name,
          categoryId,
          description,
          basePrice,
          status: status as any,
          lowStockThreshold: 5,
        }
      });

      // 2. Create Attributes & Options
      const optionMap: Record<string, string> = {}; // Mapping "AttributeName:OptionValue" -> optionId

      for (const attr of attributesData) {
        if (!attr.name || attr.options.length === 0) continue;

        const dbAttr = await tx.variantAttribute.create({
          data: {
            productId: product.id,
            name: attr.name,
          }
        });

        for (const optVal of attr.options) {
          const dbOpt = await tx.attributeOption.create({
            data: {
              attributeId: dbAttr.id,
              value: optVal
            }
          });
          optionMap[`${dbAttr.name}:${dbOpt.value}`] = dbOpt.id;
        }
      }

      // 3. Create sellable Variants
      for (const variant of variantsData) {
        // Skip disabled combinations
        if (!variant.isActive) continue; 

        const incomingStockQty = Number(variant.stockQty) || 0;

        // Either take provided SKU or auto-generate a placeholder
        const resolvedSku = variant.sku || `${name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const dbVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: resolvedSku,
            priceOverride: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
            stockQty: incomingStockQty,
            isActive: true,
          }
        });

        if (incomingStockQty > 0) {
          await tx.stockAdjustment.create({
            data: {
              variantId: dbVariant.id,
              adminId: session.userId,
              quantityChange: incomingStockQty,
              reason: "INITIAL_STOCK"
            }
          });
        }

        // 4. Link the variant option maps (Size -> S, Color -> Red)
        const optionKeys = Object.keys(variant.options || {});
        for (const attrName of optionKeys) {
          const optValue = variant.options[attrName];
          const optionId = optionMap[`${attrName}:${optValue}`];
          if (optionId) {
             await tx.variantOptionMap.create({
               data: {
                 variantId: dbVariant.id,
                 optionId: optionId
               }
             });
           }
        }
      }

      // 5. Save Images
      for (let i = 0; i < uploadedUrls.length; i++) {
        await tx.productImage.create({
          data: {
            productId: product.id,
            url: uploadedUrls[i],
            position: i
          }
        });
      }
    }, {
      maxWait: 10000, // 10s max wait to connect to prisma
      timeout: 30000, // 30s timeout for the entire transaction (handles Neon cold starts)
    });

    revalidatePath("/products");
    return { success: true };

  } catch (error) {
    console.error("Failed to create product:", error);
    
    // Cleanup orphaned images from Supabase if the database transaction failed
    if (uploadedFileNames && uploadedFileNames.length > 0) {
      await supabaseAdmin.storage.from("product-images").remove(uploadedFileNames).catch(() => {});
    }
    
    return { error: "Failed to save product. Check constraints." };
  }
}

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: {
        orderBy: { position: "asc" },
        take: 1, // Only need the cover image for the list
      },
      variants: {
        select: {
          sku: true,
          stockQty: true,
          lowStockThreshold: true,
          isActive: true,
        },
      },
    },
  });
}

export async function archiveProduct(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to archive product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Only allow deleting DRAFT products that have NO order history
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            _count: { select: { orderItems: true } },
          },
        },
      },
    });

    if (!product) return { error: "Product not found" };

    if (product.status !== "DRAFT") {
      return { error: "Only DRAFT products can be permanently deleted. Try archiving instead." };
    }

    const hasOrderHistory = product.variants.some((v) => v._count.orderItems > 0);
    if (hasOrderHistory) {
      return { error: "Cannot delete a product that has been ordered. Archive it instead." };
    }

    // Proceed to delete (Need to delete dependent relations first due to Prisma Cascade restrictions if not set in schema)
    // 1. Images
    const imagesToDelete = await prisma.productImage.findMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } });
    
    // delete from Supabase
    const fileNames = imagesToDelete.map(img => img.url.split('/').pop()).filter(Boolean) as string[];
    if (fileNames.length > 0) {
      await supabaseAdmin.storage.from("product-images").remove(fileNames);
    }
    
    // 2. Maps & Attributes
    const variantIds = product.variants.map((v) => v.id);
    await prisma.variantOptionMap.deleteMany({ where: { variantId: { in: variantIds } } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    
    const attributeIds = (
      await prisma.variantAttribute.findMany({ where: { productId: id }, select: { id: true } })
    ).map((a) => a.id);
    await prisma.attributeOption.deleteMany({ where: { attributeId: { in: attributeIds } } });
    await prisma.variantAttribute.deleteMany({ where: { productId: id } });

    // 3. Delete Product
    await prisma.product.delete({ where: { id } });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete product" };
  }
}

export async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      attributes: {
        include: { options: true },
      },
      variants: {
        include: {
          optionMaps: {
            include: {
              option: {
                include: { attribute: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updateProductStatus(id: string, status: "PUBLISHED" | "DRAFT" | "ARCHIVED") {
  try {
    await prisma.product.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status" };
  }
}

export async function adjustStock(
  variantId: string,
  newQty: number,
  reason: string
) {
  try {
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
      return { error: "Unauthorized" };
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) return { error: "Variant not found" };

    const quantityChange = newQty - variant.stockQty;

    await prisma.$transaction([
      prisma.productVariant.update({
        where: { id: variantId },
        data: { stockQty: newQty },
      }),
      prisma.stockAdjustment.create({
        data: {
          variantId,
          adminId: session.userId,
          quantityChange,
          reason,
        },
      }),
    ]);

    revalidatePath(`/products/${variant.productId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to adjust stock" };
  }
}

export async function bulkArchiveProducts(ids: string[]) {
  try {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to archive products" };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    // Spec: only DRAFT products with NO order history can be deleted.
    // For bulk, we'll find the valid candidates first.
    const products = await prisma.product.findMany({
      where: { 
        id: { in: ids },
        status: "DRAFT",
        variants: {
          none: {
            orderItems: { some: {} }
          }
        }
      },
      include: {
        images: { select: { url: true } }
      }
    });

    if (products.length === 0) {
      return { error: "No eligible products found for deletion. Only Draft products without orders can be deleted." };
    }

    const validIds = products.map(p => p.id);
    
    // Cleanup images from Supabase
    const allImages = products.flatMap(p => p.images.map((img: { url: string }) => img.url.split('/').pop()).filter(Boolean));
    if (allImages.length > 0) {
      await supabaseAdmin.storage.from("product-images").remove(allImages as string[]);
    }

    // Prisma doesn't have an easy "cascade delete" in updateMany/deleteMany without schema setup
    // So we'll do it in a transaction for the valid subset
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: { in: validIds } } }),
      prisma.variantOptionMap.deleteMany({ where: { variant: { productId: { in: validIds } } } }),
      prisma.productVariant.deleteMany({ where: { productId: { in: validIds } } }),
      prisma.variantAttribute.deleteMany({ where: { productId: { in: validIds } } }),
      prisma.product.deleteMany({ where: { id: { in: validIds } } }),
    ]);

    revalidatePath("/products");
    return { success: true, count: validIds.length };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete products" };
  }
}
