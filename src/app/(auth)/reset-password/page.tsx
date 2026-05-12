"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import { IconLock, IconLoader2, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 bg-[#FCEBEB] text-[#A32D2D] rounded-full flex items-center justify-center">
          <IconAlertCircle size={24} />
        </div>
        <h1 className="text-[20px] font-semibold">Invalid Link</h1>
        <p className="text-[14px] text-text-muted">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-[13px] font-medium text-text-primary underline">Request a new link</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    formData.append("token", token!);
    
    const res = await resetPassword(formData);

    setIsPending(false);
    if (res.error) {
      setStatus("error");
      setErrorMessage(res.error);
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-in zoom-in-95">
        <div className="w-14 h-14 bg-[#E1F5EE] text-[#0F6E56] rounded-full flex items-center justify-center border border-[#B7EBD8]">
          <IconCheck size={28} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold tracking-tight">Password Reset!</h1>
          <p className="text-[14px] text-text-muted">Your password has been successfully updated. You can now log in with your new credentials.</p>
        </div>
        <Link 
          href="/login"
          className="w-full h-[44px] bg-text-primary text-bg-primary rounded-[10px] text-[14px] font-medium hover:bg-black transition-all flex items-center justify-center"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">New Password</h1>
        <p className="text-[14px] text-text-muted leading-relaxed">
          Please enter your new administrative password. Use at least 6 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {status === "error" && (
          <div className="p-3 bg-[#FCEBEB] border border-[#F2D1D1] text-[#A32D2D] rounded-[8px] text-[12px] flex items-center gap-2">
            <IconAlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[12px] font-medium text-text-secondary px-1">New Password</label>
          <div className="relative group">
            <IconLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint group-focus-within:text-text-primary transition-colors" />
            <input 
              type="password" 
              name="password" 
              id="password" 
              required 
              minLength={6}
              placeholder="••••••••"
              className="w-full h-[44px] pl-10 pr-4 bg-bg-secondary border border-border-default rounded-[10px] text-[14px] outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
            />
          </div>
        </div>

        <button 
          disabled={isPending}
          className="w-full h-[44px] bg-text-primary text-bg-primary rounded-[10px] text-[14px] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? <IconLoader2 className="animate-spin" size={18} /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Suspense fallback={<div className="flex justify-center p-12"><IconLoader2 className="animate-spin text-text-muted" size={32} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
