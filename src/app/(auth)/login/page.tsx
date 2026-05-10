"use client";

import { Instrument_Serif } from "next/font/google";
import { login } from "@/actions/auth";
import { IconSquare } from "@tabler/icons-react";
import { useActionState } from "react";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["italic"],
});

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await login(formData);
    return result || prevState;
  }, null);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {/* Outer Layout Frame */}
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] bg-bg-secondary border border-border-strong rounded-[12px] overflow-hidden">
        
        {/* Left Panel */}
        <div className="flex flex-col justify-between w-full md:w-[44%] bg-bg-primary border-b md:border-b-0 md:border-r border-border-default p-[36px] md:p-[40px]">
          {/* Brand Mark */}
          <div className="flex items-center gap-[9px]">
            <div className="flex items-center justify-center w-[24px] h-[24px] bg-bg-primary border border-border-default text-text-primary rounded-[5px] overflow-hidden">
               {/* 24x24 dark rounded square with white stacked bars. Specs: bg #1A1A18 */}
               <div className="flex flex-col justify-center items-center w-full h-full bg-text-primary">
                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <rect x="2" y="3" width="8" height="2" fill="white"/>
                   <rect x="2" y="7" width="8" height="2" fill="white"/>
                 </svg>
               </div>
            </div>
            <span className="text-[13px] font-medium text-text-primary tracking-[-0.01em]">StoneBase</span>
          </div>

          {/* Tagline */}
          <div className="mt-[40px] md:mt-0">
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted mb-3">Admin console</p>
            <h1 className={`${instrumentSerif.className} text-[26px] leading-[1.35] text-text-secondary`}>
              Everything your <span className="text-text-primary not-italic font-sans">store needs</span>, <br className="hidden md:block" />in one place.
            </h1>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-1 flex-col justify-center p-[36px] md:p-[48px]">
          <div className="max-w-[360px] w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-[20px] font-medium text-text-primary mb-1">Sign in to your account</h2>
              <p className="text-[13px] text-text-muted">Admin access only</p>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              {state?.error && (
                <div className="p-3 mb-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-[7px]">
                  {state.error}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-text-secondary">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@stonebase.com"
                  className="h-[36px] px-3 bg-bg-primary border border-border-strong rounded-[7px] text-[13px] text-text-primary placeholder:text-[#C8C5C0] focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[11px] text-text-secondary">Password</label>
                <div className="relative flex items-center">
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-[36px] w-full px-3 pr-16 bg-bg-primary border border-border-strong rounded-[7px] text-[13px] text-text-primary placeholder:text-[#C8C5C0] focus:outline-none focus:border-text-primary focus:shadow-[0_0_0_3px_rgba(26,26,24,0.06)] transition-colors"
                  />
                  {/* Show/Hide placeholder (could be made interactive with client state) */}
                  <span className="absolute right-[12px] font-mono text-[11px] text-text-muted cursor-pointer hover:text-text-primary transition-colors">Show</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative w-[14px] h-[14px] flex items-center justify-center border border-border-strong rounded-[3px] bg-bg-primary group-hover:border-text-primary transition-colors">
                    <input type="checkbox" name="rememberMe" className="absolute opacity-0 w-0 h-0" />
                  </div>
                  <span className="text-[12px] text-text-secondary">Keep me signed in</span>
                </label>
                <a href="#" className="text-[12px] text-text-secondary hover:text-text-primary transition-colors">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="h-[36px] mt-2 bg-cta-bg text-cta-text font-medium text-[13px] rounded-[7px] hover:bg-cta-hover focus:outline-none active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-[1px] bg-border-default"></div>
              <span className="font-mono text-[11px] text-[#C8C5C0]">or</span>
              <div className="flex-1 h-[1px] bg-border-default"></div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full h-[36px] bg-bg-primary border-[1.5px] border-text-hint rounded-[8px] text-text-primary font-medium text-[13px] hover:bg-bg-tertiary focus:outline-none transition-colors"
            >
              <IconSquare size={16} stroke={1.5} className="text-text-primary" />
              Continue with SSO
            </button>
          </div>

          <div className="mt-auto pt-12 text-center">
            <p className="font-mono text-[11px] text-text-hint">v1.0.0 · StoneBase Admin · Internal use only</p>
          </div>
        </div>

      </div>
    </div>
  );
}
