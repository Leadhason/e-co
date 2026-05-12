"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const statusColors: Record<string, string> = {
  PENDING: "#185FA5",
  PROCESSING: "#3B6D11",
  SHIPPED: "#6366f1",
  DELIVERED: "#0F6E56",
  CANCELLED: "#A32D2D",
  REFUNDED: "#5F5E5A"
};

export function DoughnutChartContainer({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map(d => d.status),
    datasets: [
      {
        data: data.map(d => d._count.id),
        backgroundColor: data.map(d => statusColors[d.status] || "#A8A59F"),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1A1A18",
        bodyFont: { size: 12, family: "DM Mono" },
        padding: 10,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: (context: any) => ` ${context.parsed} orders`
        }
      }
    },
  };

  return (
    <div className="flex items-center justify-center h-full gap-8">
      <div className="h-full aspect-square">
        <Doughnut data={chartData} options={options} />
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {data.map(d => (
          <div key={d.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: statusColors[d.status] || "#A8A59F" }}
              />
              <span className="text-[11px] font-medium text-text-secondary">{d.status}</span>
            </div>
            <span className="text-[11px] font-mono text-text-muted">{d._count.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
