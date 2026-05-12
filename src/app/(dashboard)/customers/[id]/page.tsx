import { getCustomer } from "@/actions/customers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  IconArrowLeft, 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar,
  IconMapPin,
  IconReceipt,
  IconCircleCheck,
  IconLock
} from "@tabler/icons-react";
import { BlockControl } from "./block-control";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-2">
        <Link
          href="/customers"
          className="flex items-center gap-1.5 px-[10px] h-[30px] bg-bg-secondary border border-border-default rounded-[7px] text-[12px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all w-fit"
        >
          <IconArrowLeft size={14} stroke={2} aria-hidden="true" />
          Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-full bg-bg-secondary border border-border-default flex items-center justify-center text-text-muted">
              <IconUser size={24} stroke={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[20px] font-medium text-text-primary tracking-tight">
                {customer.name}
              </h1>
              <p className="text-[12px] text-text-muted">{customer.email}</p>
            </div>
            {customer.isBlocked && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium font-mono text-[#A32D2D] bg-[#FCEBEB] px-2.5 py-1 rounded-[6px] border border-[#F2D1D1]">
                <IconLock size={12} />
                Blocked Account
              </span>
            )}
          </div>
          <BlockControl customerId={customer.id} isBlocked={customer.isBlocked} reason={customer.blockReason} />
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN — Stats & History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Lifetime Value Stats */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-bg-primary border border-border-default rounded-[10px] p-[16px] flex flex-col gap-1">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Lifetime Value</span>
                <span className="text-[18px] font-mono font-medium text-[#0F6E56]">₵{totalSpent.toLocaleString()}</span>
             </div>
             <div className="bg-bg-primary border border-border-default rounded-[10px] p-[16px] flex flex-col gap-1">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Total Orders</span>
                <span className="text-[18px] font-mono font-medium text-text-primary">{customer.orders.length}</span>
             </div>
             <div className="bg-bg-primary border border-border-default rounded-[10px] p-[16px] flex flex-col gap-1">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Avg. Order</span>
                <span className="text-[18px] font-mono font-medium text-text-primary">
                  ₵{customer.orders.length > 0 ? (totalSpent / customer.orders.length).toLocaleString() : 0}
                </span>
             </div>
          </div>

          {/* Order History */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-text-primary">Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-bg-tertiary border-b border-border-default">
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Order</th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Date</th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Status</th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-[32px] text-center text-[12px] text-text-muted">No orders yet.</td>
                    </tr>
                  ) : customer.orders.map((o) => (
                    <tr key={o.id} className="group hover:bg-bg-tertiary transition-colors border-b border-border-subtle last:border-b-0">
                      <td className="px-[20px] py-[12px]">
                        <Link href={`/orders/${o.id}`} className="text-[12px] font-mono font-medium text-text-primary hover:underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-[20px] py-[12px] text-[12px] text-text-secondary">
                        {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-[20px] py-[12px] text-[11px] font-mono uppercase text-text-muted">
                        {o.status}
                      </td>
                      <td className="px-[20px] py-[12px] text-right font-mono text-[12px] text-text-primary font-medium">
                        ₵{o.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Profile Details */}
        <div className="flex flex-col gap-6">
          
          {/* Profile Summary Card */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default">
              <h2 className="text-[13px] font-medium text-text-primary">Profile</h2>
            </div>
            <div className="p-[20px] flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <IconMail size={16} className="text-text-muted" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-mono uppercase text-text-muted">Email</span>
                   <span className="text-[12px] text-text-primary">{customer.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconPhone size={16} className="text-text-muted" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-mono uppercase text-text-muted">Phone</span>
                   <span className="text-[12px] text-text-primary">{customer.phone || "Not provided"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconCalendar size={16} className="text-text-muted" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-mono uppercase text-text-muted">Customer Since</span>
                   <span className="text-[12px] text-text-primary">
                     {new Date(customer.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-text-primary">Addresses</h2>
              <IconMapPin size={16} className="text-text-muted" />
            </div>
            <div className="p-[20px] flex flex-col gap-4">
              {customer.addresses.map((addr) => (
                <div key={addr.id} className="p-3 bg-bg-secondary rounded-[8px] border border-border-subtle relative">
                  {addr.isDefault && (
                    <span className="absolute top-2 right-2 text-[9px] font-mono bg-bg-primary text-text-muted px-1 rounded border border-border-default">DEFAULT</span>
                  )}
                  <p className="text-[12px] text-text-primary leading-relaxed">
                    {addr.line1}<br />
                    {addr.line2 && <>{addr.line2}<br /></>}
                    {addr.city}, {addr.region}
                  </p>
                </div>
              ))}
              {customer.addresses.length === 0 && (
                <p className="text-[12px] text-text-muted italic text-center py-2">No addresses on file.</p>
              )}
            </div>
          </div>

          {/* Block Reason (If applicable) */}
          {customer.isBlocked && (
            <div className="bg-[#FCEBEB] border border-[#F2D1D1] rounded-[10px] p-[20px] flex flex-col gap-2">
               <span className="text-[11px] font-mono font-medium text-[#A32D2D] uppercase tracking-wider">Blocking Reason</span>
               <p className="text-[12px] text-[#A32D2D] leading-relaxed">
                 {customer.blockReason || "No specific reason provided."}
               </p>
               <span className="text-[10px] text-[#A32D2D]/60 mt-1">
                 Blocked on {new Date(customer.blockedAt!).toLocaleDateString()}
               </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
