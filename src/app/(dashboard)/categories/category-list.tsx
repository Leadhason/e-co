"use client";

import { useState } from "react";
import { IconSearch, IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { createCategory, deleteCategory, renameCategory } from "@/actions/categories";

export function CategoryList({ initialCategories }: { initialCategories: any[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const filteredCategories = initialCategories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(formData: FormData) {
    setIsPending(true);
    await createCategory(formData);
    setIsPending(false);
    setIsCreating(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this category?")) {
      const res = await deleteCategory(id);
      if (res?.error) {
        alert(res.error);
      }
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    setIsPending(true);
    const res = await renameCategory(id, editName);
    if (res?.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
    setIsPending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Utility Bar */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-[6px] h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px]">
          <IconSearch size={14} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-[12px] text-text-primary placeholder:text-text-muted w-[200px]"
          />
        </label>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-[6px] px-[12px] h-[32px] bg-cta-bg text-cta-text rounded-[7px] text-[12px] font-medium hover:bg-cta-hover active:scale-[0.99] transition-all"
        >
          <IconPlus size={14} />
          Add Category
        </button>
      </div>

      {/* Creation form */}
      {isCreating && (
        <form action={handleCreate} className="p-[20px] bg-bg-primary border border-border-default rounded-[10px] flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-mono uppercase text-text-muted">Category Name</label>
             <input name="name" required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors" placeholder="e.g. T-Shirts" />
          </div>
          <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-mono uppercase text-text-muted">Description (Optional)</label>
             <textarea name="description" rows={3} className="px-3 py-2 border border-border-strong rounded-[7px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors" placeholder="Brief description..."></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-[12px] h-[32px] border border-border-default text-text-secondary text-[12px] font-medium rounded-[7px] hover:border-text-hint hover:text-text-primary">Cancel</button>
            <button type="submit" disabled={isPending} className="px-[12px] h-[32px] bg-cta-bg text-cta-text text-[12px] font-medium rounded-[7px] hover:bg-cta-hover disabled:opacity-50">Save</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="w-full border border-border-default bg-bg-primary rounded-[10px] overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-bg-tertiary border-b border-border-default">
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Name</th>
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Description</th>
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Products</th>
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
               <tr>
                 <td colSpan={4} className="py-[32px] text-center text-[12px] text-text-muted border-b border-border-subtle">
                   {search ? "No categories found." : "No categories created yet."}
                 </td>
               </tr>
            ) : filteredCategories.map((cat, idx) => (
              <tr key={cat.id} className="group hover:bg-bg-tertiary transition-colors border-b border-border-subtle last:border-b-0">
                <td className="px-[20px] py-[10px] text-[12px] text-text-primary font-medium">
                  {editingId === cat.id ? (
                    <input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-[28px] px-2 border border-border-strong rounded-[5px] text-[12px] outline-none w-full max-w-[200px]"
                      autoFocus
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-[20px] py-[10px] text-[12px] text-text-secondary max-w-[300px] truncate">{cat.description || "—"}</td>
                <td className="px-[20px] py-[10px] text-[12px] text-text-secondary font-mono">{cat._count.products}</td>
                <td className="px-[20px] py-[10px] text-right flex justify-end gap-2">
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => setEditingId(null)} className="text-[11px] text-text-secondary hover:underline">Cancel</button>
                      <button onClick={() => handleRename(cat.id)} disabled={isPending} className="text-[11px] text-[#0F6E56] font-medium hover:underline">Save</button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary transition-all"
                      >
                        <IconEdit size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-[#A32D2D] transition-all"
                      >
                        <IconTrash size={15} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}