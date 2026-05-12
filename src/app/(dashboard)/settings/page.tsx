import { getStoreSettings } from "@/actions/settings";
import { GeneralSettingsForm } from "./general-settings-form";

export const dynamic = "force-dynamic";

export default async function GeneralSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-text-primary">General Configuration</h2>
        <p className="text-[12px] text-text-muted">Manage your store's identity and localization settings.</p>
      </div>

      <GeneralSettingsForm settings={settings} />
    </div>
  );
}
