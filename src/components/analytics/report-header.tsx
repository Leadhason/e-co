"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconDownload, IconChevronDown } from "@tabler/icons-react";

export function ReportHeader({ 
  title, 
  subtitle,
  onExport
}: { 
  title: string; 
  subtitle: string;
  onExport?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "7days";

  const setRange = (range: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("range", range);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[18px] font-medium text-text-primary tracking-tight">{title}</h1>
        <p className="text-[12px] text-text-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Date Range Selector (Design 200/201) */}
        <div className="relative group">
          <select
            value={currentRange}
            onChange={(e) => setRange(e.target.value)}
            className="h-[34px] pl-3 pr-8 bg-bg-primary border border-border-default rounded-[7px] text-[12px] font-medium text-text-secondary outline-none focus:border-text-primary appearance-none cursor-pointer hover:border-border-strong transition-colors"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <IconChevronDown size={14} />
          </div>
        </div>

        {/* Export Button (Design 192/193) */}
        <button 
          onClick={onExport}
          disabled={!onExport}
          className="flex items-center gap-1.5 h-[34px] px-3 bg-bg-primary border border-border-default rounded-[10px] text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-all disabled:opacity-50"
        >
          <IconDownload size={14} stroke={2} />
          Export
        </button>
      </div>
    </div>
  );
}

