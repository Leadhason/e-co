"use client";

import { useState } from "react";
import { IconBell, IconCheck, IconMail, IconToggleLeft, IconToggleRight } from "@tabler/icons-react";
import { updateNotificationSetting } from "@/actions/settings";

export function NotificationList({ initialSettings }: { initialSettings: any[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleToggle(id: string, currentEnabled: boolean, email: string) {
    setUpdatingId(id);
    const res = await updateNotificationSetting(id, !currentEnabled, email);
    setUpdatingId(null);
    if (res.success) {
      setSettings(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !currentEnabled } : s));
    }
  }

  async function handleEmailChange(id: string, enabled: boolean, newEmail: string) {
    setUpdatingId(id);
    const res = await updateNotificationSetting(id, enabled, newEmail);
    setUpdatingId(null);
    if (res.success) {
      setSettings(prev => prev.map(s => s.id === id ? { ...s, recipientEmail: newEmail } : s));
    }
  }

  const eventLabels: Record<string, string> = {
    "new_order": "New Order Placed",
    "order_cancelled": "Order Cancelled",
    "refund_requested": "Refund Requested",
    "low_stock": "Stock Hits Low Threshold",
    "new_customer": "New Customer Registered"
  };

  return (
    <div className="flex flex-col gap-4">
      {settings.map((s) => (
        <div key={s.id} className="bg-bg-primary border border-border-default rounded-[10px] p-[20px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border-strong transition-colors group">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              s.isEnabled ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-bg-secondary text-text-muted"
            }`}>
              <IconBell size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[14px] font-medium text-text-primary">{eventLabels[s.event] || s.event}</h3>
              <p className="text-[11px] text-text-muted italic">Triggered immediately when event occurs.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col gap-1.5 w-full md:w-[220px]">
              <label className="text-[10px] font-mono uppercase text-text-muted">Recipient Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  defaultValue={s.recipientEmail} 
                  onBlur={(e) => handleEmailChange(s.id, s.isEnabled, e.target.value)}
                  className="w-full h-[32px] pl-8 pr-3 border border-border-subtle rounded-[6px] text-[12px] outline-none focus:border-text-primary bg-bg-secondary" 
                />
                <IconMail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-hint" />
              </div>
            </div>

            <button 
              onClick={() => handleToggle(s.id, s.isEnabled, s.recipientEmail)}
              disabled={updatingId === s.id}
              className={`flex items-center gap-2 px-3 h-[32px] rounded-[7px] text-[12px] font-medium transition-all min-w-[100px] justify-center ${
                s.isEnabled 
                  ? "bg-[#0F6E56] text-white hover:bg-black" 
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle"
              }`}
            >
              {updatingId === s.id ? "..." : (s.isEnabled ? <><IconToggleRight size={16} /> Enabled</> : <><IconToggleLeft size={16} /> Disabled</>)}
            </button>
          </div>
        </div>
      ))}

      {settings.length === 0 && (
        <div className="p-12 border-2 border-dashed border-border-default rounded-[12px] flex flex-col items-center justify-center text-center bg-bg-secondary">
          <IconBell size={32} className="text-text-hint mb-3" />
          <p className="text-[13px] text-text-secondary font-medium">No notification events configured.</p>
          <p className="text-[11px] text-text-muted mt-1 max-w-[250px]">Alerts will be automatically added when system events are triggered for the first time.</p>
        </div>
      )}
    </div>
  );
}
