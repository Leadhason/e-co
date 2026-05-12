"use client";

import { useState } from "react";
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react";
import { updateAdminProfile } from "@/actions/settings";

export function ProfileForm({ profile }: { profile: any }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[500px]">
      {message && (
        <div className={`p-3 rounded-[8px] text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
          message.type === "success" ? "bg-[#E1F5EE] text-[#0F6E56] border border-[#B7EBD8]" : "bg-[#FCEBEB] text-[#A32D2D] border border-[#F2D1D1]"
        }`}>
          {message.type === "success" && <IconCheck size={14} />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Full Name</label>
        <input name="name" defaultValue={profile?.name} required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Email Address</label>
        <input name="email" type="email" defaultValue={profile?.email} required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Current Password</label>
        <input name="currentPassword" type="password" className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" placeholder="Required for password changes" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono uppercase text-text-muted tracking-wider">New Password</label>
        <input name="newPassword" type="password" className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" placeholder="Min 6 characters" />
      </div>


      <div className="pt-2">
        <span className="text-[11px] text-text-muted">Account role: <span className="font-mono uppercase text-text-primary font-medium">{profile?.role}</span></span>
      </div>

      <div className="pt-2 flex justify-start">
        <button disabled={isPending} className="flex items-center gap-2 px-[14px] h-[36px] bg-bg-secondary border border-border-default text-text-primary rounded-[7px] text-[12px] font-medium hover:bg-bg-tertiary disabled:opacity-50 transition-all">
          <IconDeviceFloppy size={16} />
          {isPending ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
}
