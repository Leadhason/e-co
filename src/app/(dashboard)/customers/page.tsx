import { getCustomers } from "@/actions/customers";
import { CustomerList } from "./customer-list";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[16px] font-medium text-text-primary">Customers</h1>
      </div>

      <CustomerList initialCustomers={customers} />
    </div>
  );
}
