"use client";

import { useState } from "react";
import { 
  IconDeviceFloppy, 
  IconCheck, 
  IconLock, 
  IconExternalLink,
  IconAlertCircle
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

      {/* Paystack Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#E8F1FC] rounded-full flex items-center justify-center text-[#185FA5]">
                <IconCreditCard size={22} />
             </div>
             <div>
                <h3 className="text-[14px] font-medium text-text-primary">Paystack Integration</h3>
                <p className="text-[11px] text-text-muted">Process secure card and mobile money payments.</p>
             </div>
          </div>
          <a href="https://dashboard.paystack.com" target="_blank" className="text-[11px] text-[#185FA5] flex items-center gap-1 hover:underline">
            Open Paystack Dashboard <IconExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5">
           <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Public Key</label>
             <div className="relative">
               <input name="paystackPublicKey" type="text" placeholder="pk_live_..." className="w-full h-[36px] pl-9 pr-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary font-mono" />
               <IconLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
             </div>
           </div>
           <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Secret Key</label>
             <div className="relative">
               <input name="paystackSecretKey" type="password" placeholder="sk_live_..." className="w-full h-[36px] pl-9 pr-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary font-mono" />
               <IconLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
             </div>
           </div>
        </div>

        <div className="p-[14px] bg-bg-secondary border border-border-default rounded-[10px] flex items-start gap-3">
          <IconAlertCircle size={18} className="text-text-muted flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
             <span className="text-[12px] font-medium text-text-primary">Webhook URL</span>
             <p className="text-[11px] text-text-muted leading-relaxed">Copy this URL to your Paystack Settings under "Webhooks":</p>
             <code className="mt-1 p-1.5 bg-bg-primary border border-border-subtle rounded text-[10px] text-text-primary block font-mono">
               https://stonebase-admin.vercel.app/api/webhooks/paystack
             </code>
          </div>
        </div>
      </section>

      {/* Global Options */}
      <section className="pt-8 border-t border-border-subtle flex flex-col gap-6">
        <h3 className="text-[14px] font-medium text-text-primary">Checkout Options</h3>
        
        <div className="flex items-center justify-between p-4 bg-bg-secondary border border-border-default rounded-[10px]">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-primary">Cash on Delivery (COD)</span>
            <p className="text-[11px] text-text-muted">Allow customers to pay when their order is delivered.</p>
          </div>
          <input type="checkbox" name="codEnabled" defaultChecked={settings.codEnabled} className="w-5 h-5 rounded border-border-strong" />
        </div>

        <div className="flex items-center justify-between p-4 bg-bg-secondary border border-border-default rounded-[10px]">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-primary">Test Mode</span>
            <p className="text-[11px] text-text-muted">Toggle between test and live transactions.</p>
          </div>
          <input type="checkbox" name="testMode" className="w-5 h-5 rounded border-border-strong" />
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

import { IconCreditCard } from "@tabler/icons-react";
