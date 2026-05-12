"use client";

import { useState } from "react";
import { 
  IconBuildingStore, 
  IconUserCircle, 
  IconDeviceFloppy,
  IconCheck
} from "@tabler/icons-react";
import { updateStoreSettings, updateAdminProfile } from "@/actions/settings";

export function SettingsTabs({ settings, profile }: { settings: any; profile: any }) {
  const [activeTab, setActiveTab] = useState<"store" | "profile">("store");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleStoreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateStoreSettings(formData);
    setIsPending(false);
    if (res.success) {
      setMessage({ type: "success", text: "Store settings updated successfully." });
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateAdminProfile(formData);
    setIsPending(false);
    if (res.success) {
      setMessage({ type: "success", text: "Profile updated successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update profile." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-bg-secondary border border-border-default rounded-[9px] w-fit">
        <button
          onClick={() => setActiveTab("store")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
            activeTab === "store" 
              ? "bg-bg-primary text-text-primary shadow-sm border border-border-subtle" 
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <IconBuildingStore size={15} />
          Store
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
            activeTab === "profile" 
              ? "bg-bg-primary text-text-primary shadow-sm border border-border-subtle" 
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <IconUserCircle size={15} />
          Profile
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-[8px] text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
          message.type === "success" ? "bg-[#E1F5EE] text-[#0F6E56] border border-[#B7EBD8]" : "bg-[#FCEBEB] text-[#A32D2D] border border-[#F2D1D1]"
        }`}>
          {message.type === "success" && <IconCheck size={14} />}
          {message.text}
        </div>
      )}

      {/* Store Tab Content */}
      {activeTab === "store" && (
        <form onSubmit={handleStoreSubmit} className="bg-bg-primary border border-border-default rounded-[12px] overflow-hidden">
          <div className="p-[20px] border-b border-border-default">
             <h2 className="text-[14px] font-medium text-text-primary">General Store Configuration</h2>
          </div>
          <div className="p-[20px] flex flex-col gap-6 max-w-[500px]">
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">Store Name</label>
               <input name="name" defaultValue={settings.name} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">Contact Email</label>
               <input name="contactEmail" defaultValue={settings.contactEmail} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">Currency Code</label>
               <input name="currency" defaultValue={settings.currency} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">Store Address</label>
               <textarea name="address" defaultValue={settings.address || ""} className="p-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary min-h-[80px]" />
             </div>
             <div className="flex items-center gap-3 py-2">
               <input type="checkbox" name="codEnabled" id="codEnabled" defaultChecked={settings.codEnabled} className="w-4 h-4 rounded border-border-strong" />
               <label htmlFor="codEnabled" className="text-[13px] text-text-primary">Enable Cash on Delivery (COD)</label>
             </div>
          </div>
          <div className="p-[16px] px-[20px] bg-bg-secondary border-t border-border-default flex justify-end">
            <button disabled={isPending} className="flex items-center gap-2 px-[14px] h-[36px] bg-cta-bg text-cta-text rounded-[7px] text-[12px] font-medium hover:bg-cta-hover disabled:opacity-50 transition-all">
              <IconDeviceFloppy size={16} />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="bg-bg-primary border border-border-default rounded-[12px] overflow-hidden">
          <div className="p-[20px] border-b border-border-default">
             <h2 className="text-[14px] font-medium text-text-primary">Admin Profile Details</h2>
          </div>
          <div className="p-[20px] flex flex-col gap-6 max-w-[500px]">
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">Full Name</label>
               <input name="name" defaultValue={profile?.name} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">Email Address</label>
               <input name="email" defaultValue={profile?.email} className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-mono uppercase text-text-muted">New Password (Leave blank to keep current)</label>
               <input name="newPassword" type="password" className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" placeholder="••••••••" />
             </div>
             <div className="pt-2">
               <span className="text-[11px] text-text-muted">Account role: <span className="font-mono uppercase text-text-primary">{profile?.role}</span></span>
             </div>
          </div>
          <div className="p-[16px] px-[20px] bg-bg-secondary border-t border-border-default flex justify-end">
            <button disabled={isPending} className="flex items-center gap-2 px-[14px] h-[36px] bg-cta-bg text-cta-text rounded-[7px] text-[12px] font-medium hover:bg-cta-hover disabled:opacity-50 transition-all">
              <IconDeviceFloppy size={16} />
              Update Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
