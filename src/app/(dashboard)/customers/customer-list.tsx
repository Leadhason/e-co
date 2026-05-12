"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  IconSearch, 
  IconUser, 
  IconArrowRight,
  IconLock,
  IconCircleCheck
} from "@tabler/icons-react";

export function CustomerList({ initialCustomers }: { initialCustomers: any[] }) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
    });
  }, [initialCustomers, search]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Utility Bar */}
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-[6px] h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px] w-full max-w-[320px]">
          <IconSearch size={14} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-[12px] text-text-primary placeholder:text-text-muted w-full"
          />
        </label>
        <div className="text-[12px] text-text-muted font-mono whitespace-nowrap">
          {filteredCustomers.length} total customers
        </div>
      </div>

      {/* Table */}
      <div className="w-full border border-border-default bg-bg-primary rounded-[10px] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-bg-tertiary border-b border-border-default">
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Customer</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Status</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Orders</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Total Spent</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Joined</th>
                <th className="px-[20px] py-[8px] w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-[64px] text-center text-[12px] text-text-muted">
                    No customers found.
                  </td>
                </tr>
              ) : filteredCustomers.map((c) => {
                const totalSpent = c.orders.reduce((sum: number, o: any) => sum + o.total, 0);
                
                return (
                  <tr key={c.id} className="group hover:bg-bg-tertiary transition-colors border-b border-border-subtle last:border-b-0">
                    <td className="px-[20px] py-[14px]">
                      <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                        <div className="w-[32px] h-[32px] rounded-full border border-border-default flex items-center justify-center bg-bg-secondary text-text-muted group-hover:text-text-primary group-hover:border-text-hint transition-all">
                          <IconUser size={16} stroke={1.5} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium text-text-primary truncate">{c.name}</span>
                          <span className="text-[11px] text-text-muted truncate">{c.email}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-[20px] py-[14px]">
                      {c.isBlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A32D2D] bg-[#FCEBEB] px-1.5 py-0.5 rounded-[4px]">
                          <IconLock size={10} />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0F6E56] bg-[#E1F5EE] px-1.5 py-0.5 rounded-[4px]">
                          <IconCircleCheck size={10} />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-[20px] py-[14px] text-right text-[12px] font-mono text-text-secondary">
                      {c._count.orders}
                    </td>
                    <td className="px-[20px] py-[14px] text-right text-[13px] font-mono font-medium text-text-primary">
                      ₵{totalSpent.toLocaleString()}
                    </td>
                    <td className="px-[20px] py-[14px] text-[12px] text-text-muted whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-[20px] py-[14px] text-right">
                      <Link href={`/customers/${c.id}`} className="text-text-muted hover:text-text-primary transition-colors">
                        <IconArrowRight size={16} stroke={1.5} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
