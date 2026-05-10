"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { 
  IconSearch, 
  IconPlus, 
  IconBox, 
  IconArchive, 
  IconLoader2, 
  IconChevronDown, 
  IconTrash,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import { 
  archiveProduct, 
  deleteProduct, 
  bulkArchiveProducts, 
  bulkDeleteProducts 
} from "@/actions/products";
import Image from "next/image";

type SortOption = "NAME" | "PRICE" | "DATE" | "STOCK";
type SortOrder = "asc" | "desc";

export function ProductList({ initialProducts, categories = [] }: { initialProducts: any[], categories?: any[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStock, setFilterStock] = useState("ALL");
  
  const [sortBy, setSortBy] = useState<SortOption>("DATE");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);

  // Reset infinite scroll when filters change
  useEffect(() => {
    setDisplayedCount(20);
  }, [search, filterStatus, filterCategory, filterStock, sortBy, sortOrder]);

  const filteredProducts = useMemo(() => {
    let result = initialProducts.filter((product) => {
      // 1. Search Query (Name or SKU)
      if (search) {
        const s = search.toLowerCase();
        const matchName = product.name.toLowerCase().includes(s);
        const matchSku = product.variants.some((v: any) => v.sku.toLowerCase().includes(s));
        if (!matchName && !matchSku) return false;
      }

      // 2. Status Filter
      if (filterStatus !== "ALL" && product.status !== filterStatus) return false;

      // 3. Category Filter
      if (filterCategory !== "ALL" && product.categoryId !== filterCategory) return false;

      // 4. Stock Level Filter
      const totalStock = product.variants.reduce((sum: number, v: any) => sum + (v.stockQty || 0), 0);
      const lowStockThreshold = product.variants[0]?.lowStockThreshold || product.lowStockThreshold;
      if (filterStock === "IN_STOCK" && totalStock <= lowStockThreshold) return false;
      if (filterStock === "LOW_STOCK" && (totalStock > lowStockThreshold || totalStock === 0)) return false;
      if (filterStock === "OUT_OF_STOCK" && totalStock > 0) return false;

      return true;
    });

    // 5. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "NAME":
          comparison = a.name.localeCompare(b.name);
          break;
        case "PRICE":
          comparison = a.basePrice - b.basePrice;
          break;
        case "DATE":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "STOCK":
          const stockA = a.variants.reduce((s: number, v: any) => s + v.stockQty, 0);
          const stockB = b.variants.reduce((s: number, v: any) => s + v.stockQty, 0);
          comparison = stockA - stockB;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [initialProducts, search, filterStatus, filterCategory, filterStock, sortBy, sortOrder]);

  const displayedProducts = filteredProducts.slice(0, displayedCount);

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkArchive = async () => {
    if (!confirm(`Archive ${selectedIds.size} products?`)) return;
    setIsBulkLoading(true);
    await bulkArchiveProducts(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Permanently delete selected products? Only DRAFT products without order history will be removed.`)) return;
    setIsBulkLoading(true);
    const res = await bulkDeleteProducts(Array.from(selectedIds));
    if (res.error) alert(res.error);
    setSelectedIds(new Set());
    setIsBulkLoading(false);
  };

  // Infinite Scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredProducts.length) {
          setTimeout(() => {
            setDisplayedCount((prev) => prev + 20);
          }, 200);
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedCount, filteredProducts.length]);

  return (
    <div className="flex flex-col gap-4 flex-1 relative pb-20">
      {/* Utility Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-[6px] h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px]">
            <IconSearch size={14} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search products or SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[12px] text-text-primary placeholder:text-text-muted w-[200px]"
            />
          </label>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px] text-[12px] text-text-secondary outline-none focus:border-text-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23A8A59F%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]"
          >
            <option value="DATE">Newest First</option>
            <option value="NAME">Name (A-Z)</option>
            <option value="PRICE">Price</option>
            <option value="STOCK">Stock Level</option>
          </select>

          <button 
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px] text-[11px] font-mono text-text-muted hover:text-text-primary uppercase tracking-wider transition-colors"
          >
            {sortOrder}
          </button>

          <div className="w-[1px] h-[16px] bg-border-default mx-1 hidden sm:block"></div>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px] text-[12px] text-text-secondary outline-none focus:border-text-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23A8A59F%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select 
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px] text-[12px] text-text-secondary outline-none focus:border-text-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23A8A59F%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>

        {/* Global CTA */}
        <Link 
          href="/products/new"
          className="flex items-center gap-[6px] px-[12px] h-[32px] bg-cta-bg text-cta-text rounded-[7px] text-[12px] font-medium hover:bg-cta-hover active:scale-[0.99] transition-all"
        >
          <IconPlus size={14} />
          Add Product
        </Link>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-text-primary text-bg-primary px-4 py-2 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 pr-4 border-r border-bg-primary/20">
            <span className="text-[12px] font-medium font-mono">{selectedIds.size} selected</span>
            <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-bg-primary/10 rounded-full transition-colors">
              <IconX size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={isBulkLoading}
              onClick={handleBulkArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-bg-primary/10 rounded-[6px] text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              <IconArchive size={14} />
              Archive
            </button>
            <button 
              disabled={isBulkLoading}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#ff4d4d]/20 text-[#ff4d4d] rounded-[6px] text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              <IconTrash size={14} />
              Delete
            </button>
          </div>

          {isBulkLoading && (
            <IconLoader2 size={16} className="animate-spin text-bg-primary/50" />
          )}
        </div>
      )}

      {/* Table */}
      <div className="w-full border border-border-default bg-bg-primary rounded-[10px] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-bg-tertiary border-b border-border-default sticky top-0 z-10 shadow-[0_1px_0_0_#E4E2DE]">
                <th className="px-[20px] py-[8px] w-[56px] min-w-[56px]">
                  <button 
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all
                      ${selectedIds.size === filteredProducts.length && filteredProducts.length > 0 
                        ? "bg-text-primary border-text-primary text-bg-primary" 
                        : "bg-bg-primary border-border-strong hover:border-text-primary"}`}
                  >
                    {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 && <IconCheck size={12} stroke={3} />}
                  </button>
                </th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Product</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Category</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Price</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Stock</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Status</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right"></th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="py-[64px] text-center text-[12px] text-text-muted border-b border-border-subtle">
                     {search ? "No products found matching your search." : "Your catalog is empty."}
                   </td>
                 </tr>
              ) : displayedProducts.map((p) => {
                const totalStock = p.variants.reduce((sum: number, v: any) => sum + v.stockQty, 0);
                const lowStockThreshold = p.variants[0]?.lowStockThreshold || p.lowStockThreshold;
                const coverImage = p.images[0]?.url;
                const isSelected = selectedIds.has(p.id);

                let stockLevelBadge = null;
                if (totalStock === 0) stockLevelBadge = <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#FCEBEB] text-[#A32D2D]">Out of stock</span>;
                else if (totalStock <= lowStockThreshold) stockLevelBadge = <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#FAEEDA] text-[#854F0B]">Low stock ({totalStock})</span>;
                else stockLevelBadge = <span className="inline-flex font-mono text-[12px] text-text-secondary">{totalStock}</span>;

                let statusBadge = null;
                if (p.status === "PUBLISHED") statusBadge = <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#E1F5EE] text-[#0F6E56]">Published</span>;
                else if (p.status === "DRAFT") statusBadge = <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#F1EFE8] text-[#5F5E5A]">Draft</span>;
                else statusBadge = <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#F0EDE8] text-[#A8A59F]">Archived</span>;

                return (
                  <tr key={p.id} className={`group hover:bg-bg-tertiary transition-colors border-b border-border-subtle last:border-b-0 ${isSelected ? 'bg-bg-tertiary' : ''}`}>
                    <td className="px-[20px] py-[10px]">
                      <button 
                        onClick={() => toggleSelect(p.id)}
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all
                          ${isSelected 
                            ? "bg-text-primary border-text-primary text-bg-primary" 
                            : "bg-bg-primary border-border-strong hover:border-text-primary"}`}
                      >
                        {isSelected && <IconCheck size={12} stroke={3} />}
                      </button>
                    </td>
                    <td className="px-[20px] py-[10px]">
                      <div className="flex items-center gap-3">
                        {coverImage ? (
                           <div className="w-[36px] h-[36px] rounded-[6px] border border-border-default overflow-hidden relative bg-bg-secondary flex-shrink-0">
                             <Image src={coverImage} alt={p.name} fill className="object-cover" />
                           </div>
                        ) : (
                          <div className="w-[36px] h-[36px] rounded-[6px] border border-border-default flex items-center justify-center bg-bg-tertiary flex-shrink-0">
                            <IconBox size={16} stroke={1.5} className="text-text-muted" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <Link href={`/products/${p.id}`} className="text-[13px] text-text-primary font-medium truncate hover:underline">{p.name}</Link>
                          <span className="text-[10px] font-mono text-text-muted truncate">{p.variants[0]?.sku || 'NO SKU'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-[20px] py-[10px] text-[12px] text-text-secondary">{p.category.name}</td>
                    <td className="px-[20px] py-[10px] text-[12px] font-mono text-text-primary text-right">₵{p.basePrice.toLocaleString()}</td>
                    <td className="px-[20px] py-[10px] text-right">{stockLevelBadge}</td>
                    <td className="px-[20px] py-[10px]">{statusBadge}</td>
                    <td className="px-[20px] py-[10px] text-right flex justify-end gap-2">
                       <Link 
                         href={`/products/${p.id}/edit`}
                         className="opacity-0 group-hover:opacity-100 px-[10px] py-[4px] border border-border-default text-text-secondary text-[11px] rounded-[6px] hover:border-text-hint hover:text-text-primary transition-all bg-bg-primary"
                       >
                         Edit
                       </Link>
                    </td>
                  </tr>
                );
              })}
              
              {displayedCount < filteredProducts.length && (
                <tr>
                  <td colSpan={7} className="py-[32px]">
                    <div ref={observerTarget} className="flex justify-center items-center w-full">
                      <IconLoader2 size={20} className="text-text-muted animate-spin" />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}