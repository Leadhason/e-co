"use client";

import Link from "next/link";
import { IconArrowUpRight, IconMinus, IconAlertTriangle } from "@tabler/icons-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function DashboardClient({ stats }: { stats: any }) {
  const lineChartData = {
    labels: stats.revenueChart.labels,
    datasets: [
      {
        label: "Revenue",
        data: stats.revenueChart.values,
        borderColor: "#1A1A18",
        borderWidth: 1.5,
        pointRadius: 3,
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(26,26,24,0.04)",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#A8A59F" },
      },
      y: {
        grid: { color: "#F0EDE8" },
        ticks: {
          callback: (value: any) => `₵${value.toLocaleString()}`,
        },
      },
    },
  };

  // Process status distribution for doughnut
  const statusLabels = stats.statusDistribution.map((s: any) => s.status);
  const statusCounts = stats.statusDistribution.map((s: any) => s.count);
  
  const statusColors: Record<string, string> = {
    PENDING: "#185FA5",
    PROCESSING: "#3B6D11",
    SHIPPED: "#6366f1",
    DELIVERED: "#0F6E56",
    CANCELLED: "#A32D2D",
  };

  const doughnutChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusCounts,
        backgroundColor: statusLabels.map((l: string) => statusColors[l] || "#A8A59F"),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <>
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[20px]">
        {/* Metric 1: Total Revenue */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1 font-mono uppercase tracking-wider">Total Revenue</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">₵ {stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-[11px] font-mono text-[#0F6E56]">
               LTV
            </div>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1 font-mono uppercase tracking-wider">Total Orders</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">{stats.ordersCount}</div>
            <div className="flex items-center text-[11px] font-mono text-text-muted">
              Lifetime
            </div>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1 font-mono uppercase tracking-wider">Active Products</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">{stats.activeProducts}</div>
            <div className="flex items-center text-[11px] font-mono text-[#3B6D11]">
              Live
            </div>
          </div>
        </div>

        {/* Metric 4: Low Stock */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1 font-mono uppercase tracking-wider">Low Stock Alerts</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-[#A32D2D] tracking-[-0.02em]">{stats.lowStockCount}</div>
            <div className="flex items-center text-[11px] font-mono text-[#A32D2D]">
              <IconAlertTriangle size={14} className="mr-0.5" />
              Action Needed
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px] mb-[20px]">
        {/* Revenue Chart */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col h-[340px]">
          <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
            <h2 className="text-[13px] font-medium text-text-primary">Revenue (Last 7 Days)</h2>
          </div>
          <div className="flex-1 p-[20px]">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col h-[340px]">
          <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
            <h2 className="text-[13px] font-medium text-text-primary">Order Distribution</h2>
          </div>
          <div className="flex-1 p-[24px] flex items-center gap-[40px] justify-center lg:justify-between">
             <div className="h-full max-h-[200px] aspect-square relative flex-shrink-0 flex items-center justify-center">
               <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
             </div>
             <div className="flex flex-col gap-[12px] w-full max-w-[160px]">
               {stats.statusDistribution.map((s: any) => (
                 <div key={s.status} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-[8px] h-[8px] rounded-[2px]" style={{ backgroundColor: statusColors[s.status] || "#A8A59F" }}></div>
                     <span className="text-[12px] text-text-secondary">{s.status}</span>
                   </div>
                   <span className="font-mono text-[12px] text-text-primary font-medium">{s.count}</span>
                 </div>
               ))}
               {stats.statusDistribution.length === 0 && (
                 <p className="text-[12px] text-text-muted italic">No orders recorded.</p>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
        {/* Recent Orders Table */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
          <div className="p-[14px] px-[20px] border-b border-border-default flex items-center justify-between">
            <h2 className="text-[13px] font-medium text-text-primary">Recent Orders</h2>
            <Link href="/orders" className="text-[11px] text-text-muted hover:text-text-primary transition-colors">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-bg-tertiary border-b border-border-default">
                  <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Order</th>
                  <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Customer</th>
                  <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="border-b border-border-subtle last:border-b-0 hover:bg-bg-tertiary transition-colors">
                    <td className="px-[20px] py-[12px]">
                      <Link href={`/orders/${o.id}`} className="text-[12px] font-mono font-medium text-text-primary hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-[20px] py-[12px] text-[12px] text-text-secondary">{o.customer}</td>
                    <td className="px-[20px] py-[12px] text-right font-mono text-[12px] text-text-primary">₵{o.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
          <div className="p-[14px] px-[20px] border-b border-border-default">
            <h2 className="text-[13px] font-medium text-text-primary">Top Selling Products</h2>
          </div>
          <div className="p-[20px] flex flex-col gap-4">
            {stats.topProducts.map((p: any, idx: number) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-text-muted w-4">0{idx + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-text-primary">{p.name}</span>
                    <span className="text-[11px] text-text-muted">{p.sales} units sold</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[12px] font-mono font-medium text-[#0F6E56]">₵{p.revenue.toLocaleString()}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Revenue</span>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p className="text-[12px] text-text-muted italic text-center py-4">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
