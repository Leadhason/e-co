import { exportData, getAdminProfile } from "@/actions/settings";
import { ExportTools } from "./export-tools";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ExportsSettingsPage() {
  const profile = await getAdminProfile();
  if (profile?.role !== "OWNER") redirect("/settings");

  return (

    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-text-primary">Data Portability & Exports</h2>
        <p className="text-[12px] text-text-muted">Export your store's data to CSV for reporting and backup purposes.</p>
      </div>

      <ExportTools />
    </div>
  );
}
