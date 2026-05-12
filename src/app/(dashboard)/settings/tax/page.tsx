import { getStoreSettings, getAdminProfile } from "@/actions/settings";
import { TaxSettingsForm } from "./tax-settings-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TaxSettingsPage() {
  const profile = await getAdminProfile();
  if (profile?.role !== "OWNER") redirect("/settings");

  const settings = await getStoreSettings();


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-text-primary">Taxation Rules</h2>
        <p className="text-[12px] text-text-muted">Configure how taxes are calculated and displayed at checkout.</p>
      </div>

      <TaxSettingsForm settings={settings} />
    </div>
  );
}
