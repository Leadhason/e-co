import { getOrder } from "@/actions/orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  IconArrowLeft, 
  IconUser, 
  IconMapPin, 
  IconCreditCard, 
  IconHistory, 
  IconNote,
  IconCircleFilled
} from "@tabler/icons-react";
import { StatusUpdater } from "./status-updater";
import { NoteCreator } from "./note-creator";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  const session = await verifySession();

  if (!order) notFound();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-[#854F0B]";
      case "PROCESSING": return "text-[#0369A1]";
      case "SHIPPED": return "text-[#0F6E56]";
      case "DELIVERED": return "text-[#0F6E56]";
      case "CANCELLED": return "text-[#A32D2D]";
      default: return "text-text-muted";
    }
  };

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-[10px] h-[30px] bg-bg-secondary border border-border-default rounded-[7px] text-[12px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all w-fit"
          >
            <IconArrowLeft size={14} stroke={2} aria-hidden="true" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-medium text-text-primary tracking-tight">
              Order <span className="font-mono">{order.orderNumber}</span>
            </h1>
            <span className={`flex items-center gap-1.5 text-[12px] font-medium font-mono ${getStatusColor(order.status)} bg-bg-secondary px-2.5 py-1 rounded-[6px] border border-border-default`}>
              <IconCircleFilled size={8} />
              {order.status}
            </span>
          </div>
          <p className="text-[12px] text-text-muted">
            Placed on {new Date(order.createdAt).toLocaleString("en-GB", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusUpdater 
            orderId={order.id} 
            currentStatus={order.status} 
            adminId={session.userId!} 
          />
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN — Items & Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Order Items */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-text-primary">Order Items</h2>
              <span className="text-[11px] font-mono text-text-muted">{order.items.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-bg-tertiary border-b border-border-default">
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px]">Product</th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Price</th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Qty</th>
                    <th className="font-normal text-[11px] text-text-muted px-[20px] py-[8px] text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-border-subtle last:border-b-0">
                      <td className="px-[20px] py-[12px]">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-text-primary">{item.productName}</span>
                          <span className="text-[11px] text-text-secondary">{item.variantName}</span>
                          <span className="text-[10px] font-mono text-text-muted mt-0.5">{item.sku}</span>
                        </div>
                      </td>
                      <td className="px-[20px] py-[12px] text-right font-mono text-[12px] text-text-secondary">
                        ₵{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-[20px] py-[12px] text-right font-mono text-[12px] text-text-secondary">
                        {item.quantity}
                      </td>
                      <td className="px-[20px] py-[12px] text-right font-mono text-[13px] text-text-primary font-medium">
                        ₵{item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals Section */}
            <div className="p-[20px] border-t border-border-default bg-bg-secondary/30">
              <div className="flex flex-col gap-2 max-w-[280px] ml-auto">
                <div className="flex justify-between text-[12px] text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-mono">₵{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px] text-text-secondary">
                  <span>Shipping Fee</span>
                  <span className="font-mono">₵{order.shippingFee.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[12px] text-[#A32D2D]">
                    <span>Discount</span>
                    <span className="font-mono">-₵{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border-default text-[14px] font-bold text-text-primary mt-1">
                  <span>Total</span>
                  <span className="font-mono text-[#0F6E56]">₵{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center gap-2">
              <IconHistory size={16} className="text-text-muted" />
              <h2 className="text-[13px] font-medium text-text-primary">Order History</h2>
            </div>
            <div className="p-[20px] flex flex-col gap-6">
              {order.statusLogs.map((log, idx) => (
                <div key={log.id} className="relative flex gap-4 last:mb-0 pb-6 last:pb-0 border-l border-border-strong ml-2.5">
                  <div className="absolute -left-[5px] top-0 w-[10px] h-[10px] rounded-full bg-text-primary border-2 border-bg-primary" />
                  <div className="flex flex-col gap-1 pl-6">
                    <p className="text-[13px] font-medium text-text-primary">
                      Status changed to <span className="font-mono uppercase text-[11px] px-1.5 py-0.5 bg-bg-secondary rounded border border-border-subtle">{log.status}</span>
                    </p>
                    <p className="text-[11px] text-text-muted">
                      by {log.admin.name} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {order.statusLogs.length === 0 && (
                <p className="text-[12px] text-text-muted italic text-center py-4">No activity logs yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Customer & Notes */}
        <div className="flex flex-col gap-6">
          
          {/* Customer Details */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center gap-2">
              <IconUser size={16} className="text-text-muted" />
              <h2 className="text-[13px] font-medium text-text-primary">Customer</h2>
            </div>
            <div className="p-[20px] flex flex-col gap-5">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider mb-1">Name</span>
                <span className="text-[13px] text-text-primary font-medium">{order.customer.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider mb-1">Contact</span>
                <span className="text-[12px] text-text-secondary">{order.customer.email}</span>
                {order.customer.phone && <span className="text-[12px] text-text-secondary">{order.customer.phone}</span>}
              </div>
              <div className="flex flex-col pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-1.5 mb-2">
                  <IconMapPin size={14} className="text-text-muted" />
                  <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider">Shipping Address</span>
                </div>
                <div className="text-[12px] text-text-secondary leading-relaxed">
                  {order.address.line1}<br />
                  {order.address.line2 && <>{order.address.line2}<br /></>}
                  {order.address.city}, {order.address.region}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center gap-2">
              <IconCreditCard size={16} className="text-text-muted" />
              <h2 className="text-[13px] font-medium text-text-primary">Payment</h2>
            </div>
            <div className="p-[20px] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-text-secondary">Method</span>
                <span className="text-[12px] font-medium text-text-primary">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-text-secondary">Status</span>
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] 
                  ${order.paymentStatus === 'PAID' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#F1EFE8] text-[#5F5E5A]'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paystackRef && (
                <div className="flex flex-col gap-1 mt-1 pt-3 border-t border-border-subtle">
                  <span className="text-[11px] font-mono text-text-muted">Paystack Ref:</span>
                  <span className="text-[11px] font-mono text-text-secondary break-all">{order.paystackRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
            <div className="p-[14px] px-[20px] border-b border-border-default flex items-center gap-2">
              <IconNote size={16} className="text-text-muted" />
              <h2 className="text-[13px] font-medium text-text-primary">Internal Notes</h2>
            </div>
            <div className="p-[20px] flex flex-col gap-4">
              <NoteCreator orderId={order.id} />
              <div className="flex flex-col gap-3 mt-2">
                {order.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-bg-secondary rounded-[8px] border border-border-subtle">
                    <p className="text-[12px] text-text-primary whitespace-pre-wrap">{note.note}</p>
                    <p className="text-[10px] text-text-muted mt-2 font-mono flex items-center justify-between">
                      <span>{note.admin.name}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                ))}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
