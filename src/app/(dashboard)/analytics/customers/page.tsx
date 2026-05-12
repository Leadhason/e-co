import { getCustomersReport } from "@/actions/analytics";
import { CustomersClient } from "./customers-client";

export default async function CustomersReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const data = await getCustomersReport(range);

  return <CustomersClient data={data} />;
}

