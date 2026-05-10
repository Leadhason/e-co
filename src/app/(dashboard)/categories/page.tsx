import { getCategories } from "@/actions/categories";
import { CategoryList } from "./category-list";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[16px] font-medium text-text-primary">Categories</h1>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  );
}