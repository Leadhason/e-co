"use client";

import { IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react";
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

export default function DashboardOverview() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const lineChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue",
        data: [12, 19, 15, 25, 22, 30, 28],
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
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#A8A59F",
        },
      },
      y: {
        grid: {
          color: "#F0EDE8",
        },
        ticks: {
          callback: (value: any) => `₵${value}k`,
        },
      },
    },
  };

  const doughnutChartData = {
    labels: ["Pending", "Shipped", "Delivered", "Cancelled"],
    datasets: [
      {
        data: [45, 30, 20, 5],
        backgroundColor: ["#185FA5", "#3B6D11", "#0F6E56", "#A32D2D"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[16px] font-medium text-text-primary">Overview</h1>
        <span className="font-mono text-[12px] text-text-muted">{currentDate}</span>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[20px]">
        {/* Metric 1 */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1">Total revenue</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">₵ 124,500</div>
            <div className="flex items-center text-[11px] font-mono text-[#3B6D11]">
              <IconArrowUpRight size={12} stroke={1.5} className="mr-0.5" />
              12.5%
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1">Orders today</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">42</div>
            <div className="flex items-center text-[11px] font-mono text-[#A32D2D]">
              <IconArrowDownRight size={12} stroke={1.5} className="mr-0.5" />
              3.2%
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1">Active products</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">1,204</div>
            <div className="flex items-center text-[11px] font-mono text-text-muted">
              <IconMinus size={12} stroke={1.5} className="mr-0.5" />
              0.0%
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] p-[14px] px-[16px]">
          <div className="text-[11px] text-text-muted mb-1">Low stock alerts</div>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">8</div>
            <div className="flex items-center text-[11px] font-mono text-[#A32D2D]">
              <IconArrowUpRight size={12} stroke={1.5} className="mr-0.5" />
              +2
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px] mb-[20px]">
        {/* Line Chart Card (Placeholder) */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col h-[300px]">
          <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
            <h2 className="text-[13px] font-medium text-text-primary">Revenue (last 7 days)</h2>
          </div>
          <div className="flex flex-1 items-center justify-center p-[20px] bg-bg-primary">
            <div className="w-full h-full relative">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Doughnut Chart Card (Placeholder) */}
        <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col h-[300px]">
          <div className="flex items-center justify-between p-[14px] px-[20px] border-b border-border-default">
            <h2 className="text-[13px] font-medium text-text-primary">Orders by status</h2>
          </div>
          <div className="flex-1 p-[20px] flex items-center justify-between gap-[32px] bg-bg-primary">
             <div className="h-full aspect-square relative m-auto">
               <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
             </div>
             <div className="flex flex-col gap-[8px] justify-center w-[140px]">
               <div className="flex items-center gap-[8px]">
                 <div className="w-[8px] h-[8px] rounded-[2px] bg-[#185FA5]"></div>
                 <span className="font-mono text-[11px] text-text-muted">Pending (45%)</span>
               </div>
               <div className="flex items-center gap-[8px]">
                 <div className="w-[8px] h-[8px] rounded-[2px] bg-[#3B6D11]"></div>
                 <span className="font-mono text-[11px] text-text-muted">Shipped (30%)</span>
               </div>
               <div className="flex items-center gap-[8px]">
                 <div className="w-[8px] h-[8px] rounded-[2px] bg-[#0F6E56]"></div>
                 <span className="font-mono text-[11px] text-text-muted">Delivered (20%)</span>
               </div>
               <div className="flex items-center gap-[8px]">
                 <div className="w-[8px] h-[8px] rounded-[2px] bg-[#A32D2D]"></div>
                 <span className="font-mono text-[11px] text-text-muted">Cancelled (5%)</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
