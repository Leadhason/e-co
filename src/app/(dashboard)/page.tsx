import { getDashboardStats } from "@/actions/dashboard";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[16px] font-medium text-text-primary">Overview</h1>
        <span className="font-mono text-[12px] text-text-muted">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      </div>

      <DashboardClient stats={stats} />
    </div>
  );
}
