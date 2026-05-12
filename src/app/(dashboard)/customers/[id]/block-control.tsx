"use client";

import { useState, useTransition } from "react";
import { toggleCustomerBlock } from "@/actions/customers";
import { IconLock, IconLockOpen, IconLoader2, IconX } from "@tabler/icons-react";

export function BlockControl({
  customerId,
  isBlocked,
  reason,
}: {
  customerId: string;
  isBlocked: boolean;
  reason?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const handleToggle = () => {
    if (isBlocked) {
      if (confirm("Unblock this customer?")) {
        startTransition(async () => {
          await toggleCustomerBlock(customerId, false);
        });
      }
    } else {
      setShowModal(true);
    }
  };

  const confirmBlock = () => {
    if (!blockReason.trim()) return;
    
    startTransition(async () => {
      await toggleCustomerBlock(customerId, true, blockReason);
      setShowModal(false);
      setBlockReason("");
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`flex items-center gap-2 px-[14px] h-[36px] rounded-[7px] text-[12px] font-medium transition-all active:scale-[0.98] disabled:opacity-50 ${
          isBlocked 
            ? "bg-bg-primary border border-border-default text-text-primary hover:bg-bg-secondary" 
            : "bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F2D1D1]"
        }`}
      >
        {isPending ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : isBlocked ? (
          <>
            <IconLockOpen size={16} stroke={1.5} />
            Unblock Account
          </>
        ) : (
          <>
            <IconLock size={16} stroke={1.5} />
            Block Account
          </>
        )}
      </button>

      {/* Block Reason Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/20 backdrop-blur-[2px] p-4">
          <div className="bg-bg-primary border border-border-default rounded-[12px] shadow-xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <h3 className="text-[14px] font-medium text-text-primary">Block Customer</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Blocking this customer will prevent them from placing new orders. Please provide a reason for this action.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase text-text-muted">Reason for blocking</label>
                <textarea
                  autoFocus
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Repeated fraudulent activity..."
                  className="w-full min-h-[100px] p-3 bg-bg-secondary border border-border-strong rounded-[8px] text-[13px] text-text-primary outline-none focus:border-text-primary transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-[36px] rounded-[7px] border border-border-default text-[12px] font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBlock}
                  disabled={!blockReason.trim() || isPending}
                  className="flex-1 h-[36px] rounded-[7px] bg-[#A32D2D] text-white text-[12px] font-medium hover:bg-[#852525] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isPending ? "Blocking..." : "Confirm Block"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

