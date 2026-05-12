import { getShippingZones } from "@/actions/shipping";
import { ZoneList } from "./zone-list";

export const dynamic = "force-dynamic";

export default async function ShippingSettingsPage() {
  const zones = await getShippingZones();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-text-primary">Shipping & Logistics</h2>
        <p className="text-[12px] text-text-muted">Define delivery zones, flat rates, and free shipping thresholds.</p>
      </div>

      <ZoneList initialZones={zones} />
    </div>
  );
}
