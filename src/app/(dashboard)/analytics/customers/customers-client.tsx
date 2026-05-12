"use client";

import { ReportHeader } from "@/components/analytics/report-header";
import { MetricCard } from "@/components/analytics/metric-card";
import { BreakdownTable } from "@/components/analytics/breakdown-table";
import { downloadCSV } from "@/lib/csv";

export function CustomersClient({ data }: { data: any }) {
  const handleExport = () => {
    const exportData = data.topCustomers.map((c: any) => ({
      Customer: c.name,
      Email: c.email,
      Orders: c.orders,
      "Lifetime Spend": c.totalSpent
    }));
    downloadCSV("Customers_Report", exportData);
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportHeader 
        title="Customers Report" 
        subtitle="Understand your audience, track growth, and identify your most valuable customers." 
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricCard label="Total Lifetime Customers" value={data.totalCustomers.toString()} isNeutral />
        <MetricCard label="New Customers (in period)" value={data.newCustomers.toString()} isNeutral />
      </div>

      <div className="bg-bg-primary border border-border-default rounded-[10px] p-[20px]">
         <h2 className="text-[13px] font-medium text-text-primary mb-6">Customer Acquisition</h2>
         <div className="h-[300px] flex items-center justify-center border border-dashed border-border-default rounded-[8px] bg-bg-secondary/50">
            <p className="text-[12px] text-text-muted font-mono uppercase">Acquisition Chart Placeholder</p>
         </div>
      </div>

      <BreakdownTable 
        title="Top Customers by Lifetime Value" 
        items={data.topCustomers.map((c: any) => ({
          label: c.name,
          value: `₵${c.totalSpent.toLocaleString()}`,
          meta: `${c.orders} orders • ${c.email}`
        }))}
      />
    </div>
  );
}
