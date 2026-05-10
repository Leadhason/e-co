"use client";

import { useState, useTransition } from "react";
import { IconAdjustments } from "@tabler/icons-react";
import { adjustStock } from "@/actions/products";

const REASONS = [
  { value: "RESTOCK", label: "Restock" },
  { value: "DAMAGED", label: "Damaged / Loss" },
  { value: "CORRECTION", label: "Correction" },
];

export function StockAdjuster({
  variantId,
  currentQty,
}: {
  variantId: string;
  currentQty: number;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(String(currentQty));
  const [reason, setReason] = useState("RESTOCK");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setQty(String(currentQty));
    setReason("RESTOCK");
    setError(null);
    setOpen(true);
  }

  function handleSubmit() {
    const newQty = parseInt(qty);
    if (isNaN(newQty) || newQty < 0) {
      setError("Enter a valid quantity (0 or more).");
      return;
    }
    startTransition(async () => {
      const res = await adjustStock(variantId, newQty, reason);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        aria-label="Adjust stock"
        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary transition-all"
      >
        <IconAdjustments size={15} stroke={1.5} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-[28px] px-2 border border-border-strong rounded-[6px] text-[11px] text-text-secondary outline-none focus:border-text-primary bg-bg-primary"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-[60px] h-[28px] px-2 border border-border-strong rounded-[6px] text-[12px] font-mono text-text-primary text-right outline-none focus:border-text-primary"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-[8px] h-[28px] bg-cta-bg text-cta-text text-[11px] font-medium rounded-[6px] hover:bg-cta-hover disabled:opacity-50 transition-all"
        >
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-[11px] text-text-secondary hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="text-[11px] text-[#A32D2D]">{error}</p>
      )}
    </div>
  );
}
