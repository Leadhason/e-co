import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../new/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      images: { orderBy: { position: 'asc' } },
      attributes: {
        include: { options: true }
      },
      variants: {
        include: { optionMaps: { include: { option: { include: { attribute: true } } } } }
      }
    }
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany();

  const attributes = product.attributes.map(a => ({
    id: a.id,
    name: a.name,
    options: a.options.map(o => o.value)
  }));

  const variants = product.variants.map(v => {
    const opts: Record<string, string> = {};
    v.optionMaps.forEach(om => {
      opts[om.option.attribute.name] = om.option.value;
    });
    return {
      id: v.id,
      sku: v.sku,
      priceOverride: v.priceOverride?.toString() || "",
      stockQty: v.stockQty,
      isActive: v.isActive,
      options: opts
    };
  });

  const initialData = {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    description: product.description || "",
    basePrice: product.basePrice,
    status: product.status,
    images: product.images,
    attributes,
    variants
  };

  return (
    <div className="flex flex-col gap-6 max-w-[800px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-[16px] font-medium text-text-primary">Edit Product</h1>
        <p className="text-[12px] text-text-secondary">Update the product details, variants, and stock.</p>
      </div>

      <ProductForm categories={categories} initialData={initialData} />
    </div>
  );
}
