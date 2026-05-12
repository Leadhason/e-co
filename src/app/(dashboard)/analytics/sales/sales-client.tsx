"use client";

import { ReportHeader } from "@/components/analytics/report-header";
import { MetricCard } from "@/components/analytics/metric-card";
import { LineChartContainer } from "@/components/analytics/line-chart-container";
import { BreakdownTable } from "@/components/analytics/breakdown-table";
import { downloadCSV } from "@/lib/csv";

export function SalesClient({ data }: { data: any }) {
  const handleExport = () => {
    const exportData = data.chartData.map((d: any) => ({
      Date: new Date(d.createdAt).toLocaleDateString(),
      Revenue: d.total,
    }));
    downloadCSV("Sales_Report", exportData);
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportHeader 
        title="Sales Report" 
        subtitle="Track revenue, average order value, and volume trends over time." 
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard 
          label="Total Revenue" 
          value={`₵${data.metrics.revenue.toLocaleString()}`} 
          prevValue={data.metrics.prevRevenue}
        />
        <MetricCard 
          label="Total Orders" 
          value={data.metrics.orders.toString()} 
          prevValue={data.metrics.prevOrders}
        />
        <MetricCard 
          label="Average Order Value" 
          value={`₵${Math.round(data.metrics.aov).toLocaleString()}`} 
          isNeutral
        />
      </div>

      <div className="bg-bg-primary border border-border-default rounded-[10px] p-[20px] h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[13px] font-medium text-text-primary">Revenue over time</h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-text-primary"></div>
               <span className="text-[11px] font-mono text-text-muted uppercase">Revenue</span>
             </div>
          </div>
        </div>
        <LineChartContainer data={data.chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownTable 
          title="Breakdown by Product" 
          items={data.categoryBreakdown.map((item: any) => ({
            label: item.productName || "Unknown",
            value: `₵${(item._sum.subtotal || 0).toLocaleString()}`,
            meta: `${item._sum.quantity} units`
          }))}
        />
        <BreakdownTable 
          title="Payment Methods" 
          items={data.paymentBreakdown.map((item: any) => ({
            label: item.paymentMethod,
            value: `₵${(item._sum.total || 0).toLocaleString()}`,
            meta: `${item._count.id} orders`
          }))}
        />
      </div>
    </div>
  );
}
