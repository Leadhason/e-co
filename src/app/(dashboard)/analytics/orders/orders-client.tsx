"use client";

import { ReportHeader } from "@/components/analytics/report-header";
import { MetricCard } from "@/components/analytics/metric-card";
import { DoughnutChartContainer } from "@/components/analytics/doughnut-chart-container";
import { downloadCSV } from "@/lib/csv";

export function OrdersClient({ data }: { data: any }) {
  const handleExport = () => {
    const exportData = data.statusBreakdown.map((s: any) => ({
      Status: s.status,
      Count: s._count.id
    }));
    downloadCSV("Orders_Report", exportData);
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportHeader 
        title="Orders Report" 
        subtitle="Monitor fulfillment efficiency, status distribution, and order lifecycle trends." 
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[20px] flex flex-col gap-4">
          <h2 className="text-[13px] font-medium text-text-primary">Status Distribution</h2>
          <div className="h-[240px]">
            <DoughnutChartContainer data={data.statusBreakdown} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <MetricCard 
            label="Avg. Fulfilment Time" 
            value={`${data.avgFulfilmentHours.toFixed(1)} hrs`} 
            isNeutral 
          />
          <div className="bg-bg-primary border border-border-default rounded-[10px] p-[20px] flex-1">
             <h2 className="text-[13px] font-medium text-text-primary mb-4">Lifecycle Summary</h2>
             <div className="flex flex-col gap-4">
                {data.statusBreakdown.map((s: any) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-[12px] text-text-secondary">{s.status}</span>
                    <span className="text-[12px] font-mono font-medium">{s._count.id}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
