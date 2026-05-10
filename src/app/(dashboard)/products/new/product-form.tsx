"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/products";

import { VariantBuilder } from "@/components/products/variant-builder";
import { ImageUploader, ImageAsset } from "@/components/products/image-uploader";

export function ProductForm({ categories, initialData }: { categories: any[]; initialData?: any }) {
  const [state, action, isPending] = useActionState(createProduct, null);
  const router = useRouter();

  const [basePrice, setBasePrice] = useState(initialData?.basePrice?.toString() || "");
  const [status, setStatus] = useState<string>(initialData?.status || "DRAFT");
  const [attributes, setAttributes] = useState<any[]>(initialData?.attributes || []);
  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);
  const [images, setImages] = useState<ImageAsset[]>(
    initialData?.images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      isExisting: true
    })) || []
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/products");
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("attributesData", JSON.stringify(attributes));
    formData.append("variantsData", JSON.stringify(variants));
    formData.append("status", status);
    
    const existingImageIds = images.filter(img => img.isExisting).map(img => img.id);
    formData.append("existingImageIds", JSON.stringify(existingImageIds));

    images.forEach(img => {
      if (!img.isExisting && img.file) {
        formData.append("newImages", img.file);
      }
    });
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {initialData && <input type="hidden" name="productId" value={initialData.id} />}
      
      {state?.error && (
        <div className="p-3 text-[13px] text-[#A32D2D] bg-[#FDE7E7] border border-[#F5C2C2] rounded-[8px]">
          {state.error}
        </div>
      )}
      {/* 1. Basic Info Card */}
      <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
          <h2 className="text-[13px] font-medium text-text-primary">Basic Info</h2>
        </div>
        <div className="p-[20px] flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted">Product Name</label>
            <input name="name" defaultValue={initialData?.name} required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors" placeholder="e.g. Classic T-Shirt" />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted">Category</label>
            <select name="categoryId" defaultValue={initialData?.categoryId || ""} required className="h-[36px] px-[10px] bg-bg-primary border border-border-strong rounded-[7px] text-[13px] text-text-primary outline-none focus:border-text-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23A8A59F%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]">
               <option value="" disabled selected>Select a category...</option>
               {categories.map((c) => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-[36px] px-[10px] bg-bg-primary border border-border-strong rounded-[7px] text-[13px] text-text-primary outline-none focus:border-text-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23A8A59F%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted">Description</label>
            <textarea name="description" defaultValue={initialData?.description} rows={5} className="p-3 border border-border-strong rounded-[7px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors" placeholder="Write a compelling product description..."></textarea>
          </div>
        </div>
      </div>

      {/* 2. Media Card */}
      <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
          <h2 className="text-[13px] font-medium text-text-primary">Media</h2>
        </div>
        <div className="p-[20px]">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </div>

      {/* 3. Pricing & Variants Card */}
      <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
          <h2 className="text-[13px] font-medium text-text-primary">Pricing & Inventory</h2>
        </div>
        <div className="p-[20px] flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 max-w-[200px]">
            <label className="text-[11px] font-mono uppercase text-text-muted">Base Price</label>
            <div className="relative flex items-center">
              <span className="absolute left-[12px] text-[13px] text-text-muted font-mono">₵</span>
              <input 
                name="basePrice" 
                type="number" 
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required 
                step="any"
                className="h-[36px] w-full pl-[28px] pr-[12px] border border-border-strong rounded-[7px] text-[13px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors" 
                placeholder="0.00" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4 pt-4 border-t border-border-default">
             <div className="flex flex-col gap-1">
               <label className="text-[11px] font-mono uppercase text-text-primary">Options</label>
               <p className="text-[12px] text-text-secondary">Does this product come in multiple sizes, colors, or materials?</p>
             </div>
             
             <VariantBuilder 
               basePrice={basePrice} 
               attributes={attributes}
               setAttributes={setAttributes}
               variants={variants}
               setVariants={setVariants}
             />
          </div>
        </div>
      </div>

       {/* Form Actions Footer */}
       <div className="flex justify-end gap-3 pt-6 border-t border-border-default pb-20">
         <button type="button" className="px-[16px] h-[36px] bg-transparent border border-border-default text-text-secondary text-[13px] font-medium rounded-[7px] hover:border-text-hint hover:text-text-primary transition-all">Cancel</button>
         <button type="submit" disabled={isPending} className="px-[16px] h-[36px] bg-cta-bg text-cta-text text-[13px] font-medium rounded-[7px] hover:bg-cta-hover disabled:opacity-50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.00)]">
           {isPending ? "Saving…" : status === "PUBLISHED" ? "Publish Product" : status === "ARCHIVED" ? "Save as Archived" : "Save as Draft"}
         </button>
       </div>

    </form>
  );
}