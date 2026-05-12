import { getNotificationSettings } from "@/actions/settings";
import { NotificationList } from "./notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsSettingsPage() {
  const settings = await getNotificationSettings();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-text-primary">System Notifications</h2>
        <p className="text-[12px] text-text-muted">Configure automated alerts for critical business events.</p>
      </div>

      <NotificationList initialSettings={settings} />
    </div>
  );
}
