import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AnalyticsSubNav } from "@/components/analytics/sub-nav";

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  // Role Security: Spec 314
  if (!session.isAuth || session.role !== "OWNER") {
    redirect("/");
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Settings Sub-nav Pattern (Design 368) */}
      <AnalyticsSubNav />

      {/* Main Content Area (Design 373) */}
      <main className="flex-1 overflow-y-auto bg-bg-secondary p-[28px] md:p-[32px]">
        {children}
      </main>
    </div>
  );
}
