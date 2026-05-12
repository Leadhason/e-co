"use client";

import { useState } from "react";
import { 
  IconDeviceFloppy, 
  IconCheck, 
  IconUpload, 
  IconAlertTriangle,
  IconBuildingStore,
  IconX
} from "@tabler/icons-react";

import { updateStoreSettings } from "@/actions/settings";

export function GeneralSettingsForm({ settings }: { settings: any }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Check if currency changed
    const newCurrency = formData.get("currency") as string;
    if (newCurrency !== settings.currency) {
      setPendingFormData(formData);
      setShowCurrencyModal(true);
      return;
    }

    saveSettings(formData);
  }

  async function saveSettings(formData: FormData) {
    setIsPending(true);
    setMessage(null);
    const res = await updateStoreSettings(formData);
    setIsPending(false);
    if (res.success) {
      setMessage({ type: "success", text: "Settings updated successfully." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-default rounded-[12px] w-full max-w-[400px] shadow-2xl p-6">
            <div className="flex flex-col gap-3 text-center items-center">
               <div className="w-12 h-12 bg-[#FCEBEB] text-[#A32D2D] rounded-full flex items-center justify-center">
                  <IconAlertTriangle size={24} />
               </div>
               <h3 className="text-[16px] font-medium text-text-primary">Change Store Currency?</h3>
               <p className="text-[13px] text-text-muted leading-relaxed">
                 Changing your store currency will affect how all product prices and order totals are displayed. 
                 Existing historical data will **not** be automatically converted.
               </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
               <button 
                 type="button"
                 onClick={() => {
                   if (pendingFormData) saveSettings(pendingFormData);
                   setShowCurrencyModal(false);
                 }}
                 className="w-full h-[40px] bg-[#A32D2D] text-white rounded-[8px] text-[13px] font-medium hover:bg-black transition-all"
               >
                 Confirm & Save
               </button>
               <button 
                 type="button"
                 onClick={() => setShowCurrencyModal(false)}
                 className="w-full h-[40px] text-[13px] font-medium text-text-secondary hover:text-text-primary transition-all"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-[8px] text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
          message.type === "success" ? "bg-[#E1F5EE] text-[#0F6E56] border border-[#B7EBD8]" : "bg-[#FCEBEB] text-[#A32D2D] border border-[#F2D1D1]"
        }`}>
          {message.type === "success" && <IconCheck size={14} />}
          {message.text}
        </div>
      )}

      {/* Store Identity */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Store Logo</label>
          <div className="flex items-center gap-6">
            <div className="w-[100px] h-[100px] bg-bg-secondary border border-border-strong rounded-[12px] flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Store logo" className="w-full h-full object-contain p-2" />
              ) : (
                <IconBuildingStore size={32} className="text-text-muted" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                name="logoFile" 
                id="logo-input" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoChange}
              />
              <label 
                htmlFor="logo-input"
                className="flex items-center justify-center gap-2 px-3 h-[32px] bg-bg-primary border border-border-default rounded-[7px] text-[12px] font-medium hover:bg-bg-secondary transition-all cursor-pointer"
              >
                <IconUpload size={14} />
                Upload New Logo
              </label>
              <p className="text-[11px] text-text-muted italic">Recommended: Square PNG/SVG, max 500kb.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Store Name</label>
            <input name="name" defaultValue={settings.name} required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Contact Email</label>
            <input name="contactEmail" defaultValue={settings.contactEmail} required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Contact Phone</label>
            <input name="contactPhone" defaultValue={settings.contactPhone} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Currency</label>
            <select name="currency" defaultValue={settings.currency} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary bg-bg-primary">
              <option value="GHS">Ghanaian Cedi (₵)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Timezone</label>
          <select name="timezone" defaultValue={settings.timezone} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary bg-bg-primary">
            <option value="UTC">UTC (Universal Time)</option>
            <option value="Africa/Accra">Africa/Accra (GMT)</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Store Address</label>
          <textarea name="address" defaultValue={settings.address || ""} className="p-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary min-h-[100px]" placeholder="Full physical address for invoices..." />
        </div>
      </section>

      <div className="pt-4 border-t border-border-subtle flex justify-end">
        <button disabled={isPending} className="flex items-center gap-2 px-[16px] h-[36px] bg-text-primary text-bg-primary rounded-[7px] text-[12px] font-medium hover:bg-black disabled:opacity-50 transition-all">
          <IconDeviceFloppy size={16} />
          {isPending ? "Saving..." : "Save Store Changes"}
        </button>
      </div>
    </form>
  );
}
