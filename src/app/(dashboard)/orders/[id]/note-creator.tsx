"use client";

import { useState, useTransition } from "react";
import { addOrderNote } from "@/actions/orders";
import { IconPlus } from "@tabler/icons-react";

export function NoteCreator({ orderId }: { orderId: string }) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!note.trim()) return;

    startTransition(async () => {
      const res = await addOrderNote(orderId, note.trim());
      if (!res.error) {
        setNote("");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add an internal note..."
        className="w-full p-3 bg-bg-secondary border border-border-strong rounded-[8px] text-[12px] text-text-primary placeholder:text-text-muted outline-none focus:border-text-primary min-h-[80px] transition-colors"
      />
      <button
        onClick={handleSubmit}
        disabled={isPending || !note.trim()}
        className="flex items-center justify-center gap-1.5 h-[32px] px-[12px] bg-bg-tertiary border border-border-default text-text-secondary text-[12px] font-medium rounded-[7px] hover:text-text-primary hover:border-text-hint transition-all disabled:opacity-50"
      >
        <IconPlus size={14} />
        Add Note
      </button>
    </div>
  );
}
