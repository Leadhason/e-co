import { getProductsReport } from "@/actions/analytics";
import { ProductsClient } from "./products-client";

export default async function ProductsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const data = await getProductsReport(range);

  return <ProductsClient data={data} />;
}

