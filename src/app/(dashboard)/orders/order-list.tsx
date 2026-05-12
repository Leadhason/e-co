"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { 
  IconSearch, 
  IconLoader2, 
  IconChevronDown, 
  IconReceipt,
  IconArrowRight
} from "@tabler/icons-react";
import { OrderStatus } from "@prisma/client";

export function OrderList({ initialOrders }: { initialOrders: any[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [displayedCount, setDisplayedCount] = useState(20);

  // Status Badge Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#FAEEDA] text-[#854F0B]">Pending</span>;
      case "PROCESSING":
        return <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#E0F2FE] text-[#0369A1]">Processing</span>;
      case "SHIPPED":
        return <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#E1F5EE] text-[#0F6E56]">Shipped</span>;
      case "DELIVERED":
        return <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#E1F5EE] text-[#0F6E56]">Delivered</span>;
      case "CANCELLED":
        return <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-[#FCEBEB] text-[#A32D2D]">Cancelled</span>;
      default:
        return <span className="inline-flex py-[2px] px-[8px] rounded-[4px] font-mono text-[11px] font-medium bg-bg-secondary text-text-muted">{status}</span>;
    }
  };

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // 1. Search Query (Order # or Customer Name)
      if (search) {
        const s = search.toLowerCase();
        const matchNumber = order.orderNumber.toLowerCase().includes(s);
        const matchCustomer = order.customer.name.toLowerCase().includes(s);
        if (!matchNumber && !matchCustomer) return false;
      }

      // 2. Status Filter
      if (filterStatus !== "ALL" && order.status !== filterStatus) return false;

      return true;
    });
  }, [initialOrders, search, filterStatus]);

  const displayedOrders = filteredOrders.slice(0, displayedCount);

  // Infinite Scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredOrders.length) {
          setDisplayedCount((prev) => prev + 20);
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedCount, filteredOrders.length]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Utility Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-[6px] h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px]">
            <IconSearch size={14} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search orders or customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[12px] text-text-primary placeholder:text-text-muted w-[240px]"
            />
          </label>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-[32px] px-[10px] bg-bg-secondary border border-border-default rounded-[7px] text-[12px] text-text-secondary outline-none focus:border-text-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%23A8A59F%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="text-[12px] text-text-muted font-mono">
          {filteredOrders.length} orders found
        </div>
      </div>

      {/* Table */}
      <div className="w-full border border-border-default bg-bg-primary rounded-[10px] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-bg-tertiary border-b border-border-default sticky top-0 z-10 shadow-[0_1px_0_0_#E4E2DE]">
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Order</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Date</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Customer</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Items</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Total</th>
                <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Status</th>
                <th className="px-[20px] py-[8px] w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="py-[64px] text-center text-[12px] text-text-muted border-b border-border-subtle">
                     No orders found.
                   </td>
                 </tr>
              ) : displayedOrders.map((o) => (
                <tr key={o.id} className="group hover:bg-bg-tertiary transition-colors border-b border-border-subtle last:border-b-0">
                  <td className="px-[20px] py-[14px]">
                    <Link href={`/orders/${o.id}`} className="flex items-center gap-2">
                      <div className="w-[32px] h-[32px] rounded-[6px] border border-border-default flex items-center justify-center bg-bg-secondary text-text-muted group-hover:text-text-primary group-hover:border-text-hint transition-all">
                        <IconReceipt size={16} stroke={1.5} />
                      </div>
                      <span className="text-[13px] font-mono font-medium text-text-primary">{o.orderNumber}</span>
                    </Link>
                  </td>
                  <td className="px-[20px] py-[14px] text-[12px] text-text-secondary whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-[20px] py-[14px]">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] text-text-primary font-medium truncate">{o.customer.name}</span>
                      <span className="text-[11px] text-text-muted truncate">{o.customer.email}</span>
                    </div>
                  </td>
                  <td className="px-[20px] py-[14px] text-right text-[12px] font-mono text-text-secondary">
                    {o._count.items}
                  </td>
                  <td className="px-[20px] py-[14px] text-right text-[13px] font-mono font-medium text-text-primary">
                    ₵{o.total.toLocaleString()}
                  </td>
                  <td className="px-[20px] py-[14px]">
                    {getStatusBadge(o.status)}
                  </td>
                  <td className="px-[20px] py-[14px] text-right">
                    <Link href={`/orders/${o.id}`} className="text-text-muted hover:text-text-primary transition-colors">
                      <IconArrowRight size={16} stroke={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {displayedCount < filteredOrders.length && (
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
