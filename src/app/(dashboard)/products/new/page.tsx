import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { getCategories } from "@/actions/categories";
import { ProductForm } from "./product-form";
 
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[900px] mx-auto flex flex-col h-full overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-[24px]">
        <Link href="/products" className="flex items-center gap-[4px] text-[12px] text-text-muted hover:text-text-primary w-fit transition-colors">
          <IconArrowLeft size={14} /> Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-medium text-text-primary tracking-[-0.01em]">Add Product</h1>
        </div>
      </div>

      {/* Embedded Product Form Component handling creating logic */}
      <ProductForm categories={categories} />
    </div>
  );
}