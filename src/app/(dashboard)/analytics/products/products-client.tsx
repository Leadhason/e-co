"use client";

import { ReportHeader } from "@/components/analytics/report-header";
import { MetricCard } from "@/components/analytics/metric-card";
import { BreakdownTable } from "@/components/analytics/breakdown-table";
import { downloadCSV } from "@/lib/csv";

export function ProductsClient({ data }: { data: any }) {
  const handleExport = () => {
    const exportData = data.topSellers.map((item: any) => ({
      Product: item.productName,
      Quantity: item._sum.quantity,
      Revenue: item._sum.subtotal
    }));
    downloadCSV("Products_Report", exportData);
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportHeader 
        title="Products Report" 
        subtitle="Analyze inventory performance, identify top sellers, and monitor stock health." 
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard label="Total Variants" value={data.stockStats.total.toString()} isNeutral />
        <MetricCard label="In Stock" value={data.stockStats.inStock.toString()} isNeutral />
        <MetricCard label="Low Stock" value={data.stockStats.lowStock.toString()} isNeutral />
        <MetricCard label="Out of Stock" value={data.stockStats.outOfStock.toString()} isNeutral />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownTable 
          title="Top Selling Products (by Volume)" 
          items={data.topSellers.map((item: any) => ({
            label: item.productName || "Unknown",
            value: `${item._sum.quantity} units`,
            meta: `₵${(item._sum.subtotal || 0).toLocaleString()} revenue`
          }))}
        />
        <BreakdownTable 
          title="Most Refunded Products" 
          items={data.mostRefunded.map((item: any) => ({
            label: item.productName || "Unknown",
            value: `${item._sum.quantity} units`,
            meta: "Requires attention"
          }))}
        />
      </div>

      <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
        <div className="p-[14px] px-[20px] border-b border-border-default">
          <h2 className="text-[13px] font-medium text-[#A32D2D]">Poor Performing Products (Zero Sales)</h2>
        </div>
        <div className="flex flex-col">
          {data.worstSellers.map((product: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between px-[20px] py-[12px] border-b border-border-subtle last:border-b-0">
              <span className="text-[13px] text-text-primary">{product.name}</span>
              <span className="text-[12px] font-mono text-text-muted">₵{product.basePrice.toLocaleString()}</span>
            </div>
          ))}
          {data.worstSellers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-[12px] text-text-muted italic">Great! All products had sales in this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
