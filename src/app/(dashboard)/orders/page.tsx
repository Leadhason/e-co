import { getOrders } from "@/actions/orders";
import { OrderList } from "./order-list";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[16px] font-medium text-text-primary">Orders</h1>
      </div>

      <OrderList initialOrders={orders} />
    </div>
  );
}
