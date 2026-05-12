"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { OrderStatus } from "@prisma/client";
import { IconChevronDown } from "@tabler/icons-react";

export function StatusUpdater({
  orderId,
  currentStatus,
  adminId,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  adminId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return;
    if (!confirm(`Change order status to ${newStatus}?`)) return;

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus, adminId);
      if (res?.error) {
        alert(res.error);
      }
    });

  };

  const nextStatuses: OrderStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        className="h-[36px] pl-[12px] pr-[32px] bg-cta-bg text-cta-text rounded-[7px] text-[12px] font-medium hover:bg-cta-hover active:scale-[0.99] transition-all appearance-none cursor-pointer outline-none disabled:opacity-60"
      >
        <option value={currentStatus} disabled>Update Status</option>
        {nextStatuses.map((s) => (
          <option key={s} value={s} disabled={s === currentStatus}>
            Set to {s}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-cta-text/70">
        <IconChevronDown size={14} stroke={2.5} />
      </div>
      {isPending && (
        <div className="absolute -bottom-5 right-0 text-[10px] text-text-muted font-mono">
          Updating…
        </div>
      )}
    </div>
  );
}
