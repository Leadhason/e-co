import { getStoreSettings, getAdminProfile } from "@/actions/settings";
import { PaymentSettingsForm } from "./payment-settings-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PaymentsSettingsPage() {
  const profile = await getAdminProfile();
  if (profile?.role !== "OWNER") redirect("/settings");

  const settings = await getStoreSettings();


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-text-primary">Payment Configuration</h2>
        <p className="text-[12px] text-text-muted">Integrate Paystack and configure global checkout options.</p>
      </div>

      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
