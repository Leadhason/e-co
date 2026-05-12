"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { IconArrowLeft, IconMail, IconLoader2, IconCheck } from "@tabler/icons-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);

    setIsPending(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.message || "Reset link sent!" });
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Forgot Password?</h1>
          <p className="text-[14px] text-text-muted leading-relaxed">
            Enter your email and we'll send you a secure link to reset your administrative account.
          </p>
        </div>

        {message ? (
          <div className={`p-4 rounded-[12px] flex flex-col items-center gap-3 text-center border animate-in zoom-in-95 ${
            message.type === "success" 
              ? "bg-[#E1F5EE] border-[#B7EBD8] text-[#0F6E56]" 
              : "bg-[#FCEBEB] border-[#F2D1D1] text-[#A32D2D]"
          }`}>
            {message.type === "success" && (
              <div className="w-10 h-10 bg-[#B7EBD8] rounded-full flex items-center justify-center">
                <IconCheck size={20} />
              </div>
            )}
            <p className="text-[13px] font-medium">{message.text}</p>
            {message.type === "success" && (
              <Link 
                href="/login"
                className="text-[13px] font-medium underline underline-offset-4 opacity-80 hover:opacity-100 transition-all"
              >
                Back to Login
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[12px] font-medium text-text-secondary px-1">Email Address</label>
              <div className="relative group">
                <IconMail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint group-focus-within:text-text-primary transition-colors" />
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  required 
                  placeholder="admin@stonebase.com"
                  className="w-full h-[44px] pl-10 pr-4 bg-bg-secondary border border-border-default rounded-[10px] text-[14px] outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all"
                />
              </div>
            </div>

            <button 
              disabled={isPending}
              className="w-full h-[44px] bg-text-primary text-bg-primary rounded-[10px] text-[14px] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <IconLoader2 className="animate-spin" size={18} /> : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="flex justify-center">
          <Link 
            href="/login"
            className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-primary transition-all font-medium"
          >
            <IconArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
