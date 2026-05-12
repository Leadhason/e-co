import { getSalesReport } from "@/actions/analytics";
import { SalesClient } from "./sales-client";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const data = await getSalesReport(range);

  return <SalesClient data={data} />;
}

