"use client";

import { useState } from "react";
import { IconDownload, IconCheck, IconBox, IconReceipt, IconUsers } from "@tabler/icons-react";
import { exportData } from "@/actions/settings";

export function ExportTools() {
  const [isPending, setIsPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport(type: "products" | "orders" | "customers") {
    setIsPending(type);
    setMessage(null);
    const res = await exportData(type);
    setIsPending(null);
    
    if (res.success && res.csv && res.filename) {
      // Trigger browser download
      const blob = new Blob([res.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMessage(`Successfully exported ${type}.`);
    } else {
      setMessage(res.error || "Export failed.");
    }
  }


  const exportItems = [
    { type: "products" as const, label: "All Products", icon: IconBox, desc: "Includes all variants, stock levels, and pricing data." },
    { type: "orders" as const, label: "All Orders", icon: IconReceipt, desc: "Includes full order history, status logs, and financial totals." },
    { type: "customers" as const, label: "All Customers", icon: IconUsers, desc: "Includes contact info, total spend, and registration dates." },
  ];

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className="p-3 bg-[#E1F5EE] text-[#0F6E56] border border-[#B7EBD8] rounded-[8px] text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <IconCheck size={14} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exportItems.map((item) => (
          <div key={item.type} className="bg-bg-primary border border-border-default rounded-[10px] p-[20px] flex items-center justify-between gap-6 hover:border-border-strong transition-colors group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-[8px] bg-bg-secondary flex items-center justify-center text-text-muted group-hover:bg-text-primary group-hover:text-bg-primary transition-all">
                  <item.icon size={20} />
               </div>
               <div className="flex flex-col gap-0.5">
                  <h3 className="text-[14px] font-medium text-text-primary">{item.label}</h3>
                  <p className="text-[11px] text-text-muted max-w-[300px]">{item.desc}</p>
               </div>
            </div>
            <button 
              disabled={!!isPending}
              onClick={() => handleExport(item.type)}
              className="flex items-center gap-2 px-4 h-[36px] bg-bg-secondary border border-border-default text-text-primary rounded-[7px] text-[12px] font-medium hover:bg-bg-tertiary disabled:opacity-50 transition-all whitespace-nowrap"
            >
              <IconDownload size={14} />
              {isPending === item.type ? "Exporting..." : "Download CSV"}
            </button>
          </div>
        ))}
      </div>

      {/* Backup / Danger Zone Hint */}
      <div className="mt-8 pt-8 border-t border-border-subtle">
        <div className="bg-[#FCEBEB] border border-[#F2D1D1] rounded-[10px] p-[20px] flex items-start gap-4">
           <div className="w-8 h-8 rounded-full bg-[#A32D2D] text-white flex items-center justify-center flex-shrink-0">
              <span className="text-[14px] font-bold">!</span>
           </div>
           <div className="flex flex-col gap-2">
              <h3 className="text-[14px] font-medium text-[#A32D2D]">Irreversible Actions</h3>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Some actions, like resetting your store's currency or deleting your own account, cannot be undone. 
                These actions require secondary confirmation from the Owner.
              </p>
              <button className="mt-2 text-[12px] font-medium text-[#A32D2D] hover:underline flex items-center gap-1">
                Access Advanced Maintenance Tools
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
