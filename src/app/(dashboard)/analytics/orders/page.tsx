import { getOrdersReport } from "@/actions/analytics";
import { OrdersClient } from "./orders-client";

export default async function OrdersReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const data = await getOrdersReport(range);

  return <OrdersClient data={data} />;
}

