"use client";

import { useState, useTransition } from "react";
import { updateProductStatus } from "@/actions/products";

type Status = "PUBLISHED" | "DRAFT" | "ARCHIVED";

const STATUS_OPTIONS: { value: Status; label: string; badge: string }[] = [
  {
    value: "PUBLISHED",
    label: "Published",
    badge: "bg-[#E1F5EE] text-[#0F6E56]",
  },
  {
    value: "DRAFT",
    label: "Draft",
    badge: "bg-[#F1EFE8] text-[#5F5E5A]",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
    badge: "bg-[#F0EDE8] text-[#A8A59F]",
  },
];

export function StatusControl({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const current = STATUS_OPTIONS.find((s) => s.value === status)!;

  function handleChange(newStatus: Status) {
    if (newStatus === status) return;
    setError(null);
    startTransition(async () => {
      const res = await updateProductStatus(productId, newStatus);
      if (res?.error) {
        setError(res.error);
      } else {
        setStatus(newStatus);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Current status badge */}
      <span
        className={`inline-flex self-start py-[3px] px-[10px] rounded-[4px] font-mono text-[11px] font-medium ${current.badge}`}
      >
        {current.label}
      </span>

      {/* Status buttons */}
      <div className="flex flex-col gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            disabled={isPending || opt.value === status}
            className={`w-full text-left px-[12px] h-[32px] rounded-[7px] text-[12px] font-medium transition-all
              ${
                opt.value === status
                  ? "bg-bg-subtle text-text-primary cursor-default"
                  : "border border-border-default text-text-secondary hover:border-text-hint hover:text-text-primary"
              }
              disabled:opacity-60`}
          >
            {opt.value === status ? `✓ ${opt.label}` : `Set to ${opt.label}`}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-[11px] text-[#A32D2D]">{error}</p>
      )}

      {isPending && (
        <p className="text-[11px] text-text-muted font-mono">Saving…</p>
      )}
    </div>
  );
}
