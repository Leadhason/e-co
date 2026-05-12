import { getProducts } from "@/actions/products";
import { ProductList } from "./product-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[16px] font-medium text-text-primary">Products</h1>
      </div>

      <ProductList initialProducts={products} categories={categories} />
    </div>
  );
}