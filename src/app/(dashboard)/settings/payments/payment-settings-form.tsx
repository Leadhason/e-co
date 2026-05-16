"use client";

import { useState } from "react";
import { 
  IconDeviceFloppy, 
  IconCheck,
  IconCreditCard
} from "@tabler/icons-react";
import { updatePaymentSettings } from "@/actions/settings";

export function PaymentSettingsForm({ settings }: { settings: any }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updatePaymentSettings(formData);
    setIsPending(false);
    if (res.success) {
      setMessage({ type: "success", text: "Payment settings saved." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {message && (
        <div className={`p-3 rounded-[8px] text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
          message.type === "success" ? "bg-[#E1F5EE] text-[#0F6E56] border border-[#B7EBD8]" : "bg-[#FCEBEB] text-[#A32D2D] border border-[#F2D1D1]"
        }`}>
          {message.type === "success" && <IconCheck size={14} />}
          {message.text}
        </div>
      )}



      {/* Checkout Options */}
      <section className="flex flex-col gap-6">
        <h3 className="text-[14px] font-medium text-text-primary">Checkout Options</h3>
        
        <div className="flex items-center justify-between p-4 bg-bg-secondary border border-border-default rounded-[10px]">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-primary">Cash on Delivery (COD)</span>
            <p className="text-[11px] text-text-muted">Allow customers to pay when their order is delivered.</p>
          </div>
          <input type="checkbox" name="codEnabled" defaultChecked={settings.codEnabled} className="w-5 h-5 rounded border-border-strong" />
        </div>


      </section>

      <div className="pt-4 flex justify-end">
        <button disabled={isPending} className="flex items-center gap-2 px-[16px] h-[38px] bg-text-primary text-bg-primary rounded-[7px] text-[12px] font-medium hover:bg-black disabled:opacity-50 transition-all">
          <IconDeviceFloppy size={16} />
          {isPending ? "Saving..." : "Save Payment Configuration"}
        </button>
      </div>
    </form>
  );
}
