"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function LineChartContainer({ data }: { data: any[] }) {
  // Process data into daily buckets
  const buckets: Record<string, number> = {};
  data.forEach(item => {
    const date = new Date(item.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' });
    buckets[date] = (buckets[date] || 0) + item.total;
  });

  const chartData = {
    labels: Object.keys(buckets),
    datasets: [
      {
        data: Object.values(buckets),
        borderColor: "#1A1A18",
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: "#1A1A18",
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(26,26,24,0.03)",
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
        titleFont: { size: 11, family: "DM Mono" },
        bodyFont: { size: 12 },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `₵${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: "DM Mono" }, color: "#A8A59F" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#F0EDE8", drawTicks: false },
        border: { display: false },
        ticks: {
          font: { size: 10, family: "DM Mono" },
          color: "#A8A59F",
          callback: (value: any) => `₵${value.toLocaleString()}`,
          maxTicksLimit: 6
        },
      },
    },
  };

  return <Line data={chartData} options={options as any} />;
}
