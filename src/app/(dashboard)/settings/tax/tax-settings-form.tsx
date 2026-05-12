"use client";

import { useState } from "react";
import { IconDeviceFloppy, IconCheck, IconReceiptTax, IconInfoCircle } from "@tabler/icons-react";
import { updateTaxSettings } from "@/actions/settings";

export function TaxSettingsForm({ settings }: { settings: any }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateTaxSettings(formData);
    setIsPending(false);
    if (res.success) {
      setMessage({ type: "success", text: "Tax settings updated." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-[500px]">
      {message && (
        <div className={`p-3 rounded-[8px] text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
          message.type === "success" ? "bg-[#E1F5EE] text-[#0F6E56] border border-[#B7EBD8]" : "bg-[#FCEBEB] text-[#A32D2D] border border-[#F2D1D1]"
        }`}>
          {message.type === "success" && <IconCheck size={14} />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Global Tax Rate (%)</label>
          <div className="relative">
            <input name="taxRate" type="number" step="0.01" defaultValue={settings.taxRate || 0} required className="w-full h-[36px] pl-3 pr-8 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]">%</span>
          </div>
          <p className="text-[11px] text-text-muted italic">Set to 0 if your store is not tax-registered.</p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Tax Display Logic</label>
          
          <div className="flex flex-col gap-3">
             <div className="flex items-start gap-3 p-4 bg-bg-secondary border border-border-default rounded-[10px] cursor-pointer hover:border-border-strong transition-all">
                <input type="radio" name="taxInclusive" id="inclusive" value="on" defaultChecked={settings.taxInclusive} className="mt-1" />
                <label htmlFor="inclusive" className="flex flex-col gap-0.5 cursor-pointer">
                   <span className="text-[13px] font-medium text-text-primary">Tax Inclusive</span>
                   <p className="text-[11px] text-text-muted leading-relaxed">Product prices already include tax. The customer sees the tax breakdown at checkout but the total remains the same.</p>
                </label>
             </div>

             <div className="flex items-start gap-3 p-4 bg-bg-secondary border border-border-default rounded-[10px] cursor-pointer hover:border-border-strong transition-all">
                <input type="radio" name="taxInclusive" id="exclusive" value="off" defaultChecked={!settings.taxInclusive} className="mt-1" />
                <label htmlFor="exclusive" className="flex flex-col gap-0.5 cursor-pointer">
                   <span className="text-[13px] font-medium text-text-primary">Tax Exclusive</span>
                   <p className="text-[11px] text-text-muted leading-relaxed">Tax is added to the subtotal during the checkout process. Displayed product prices do not include tax.</p>
                </label>
             </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#F0EDE8] rounded-[10px] flex items-start gap-3 border border-border-subtle">
        <IconInfoCircle size={18} className="text-text-muted mt-0.5" />
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Changing tax settings will immediately affect all new orders. Existing orders in your database will preserve the tax calculation they were created with.
        </p>
      </div>

      <div className="pt-4 flex justify-start">
        <button disabled={isPending} className="flex items-center gap-2 px-[16px] h-[36px] bg-bg-secondary border border-border-default text-text-primary rounded-[7px] text-[12px] font-medium hover:bg-bg-tertiary disabled:opacity-50 transition-all">
          <IconDeviceFloppy size={16} />
          {isPending ? "Applying..." : "Save Tax Settings"}
        </button>
      </div>
    </form>
  );
}
