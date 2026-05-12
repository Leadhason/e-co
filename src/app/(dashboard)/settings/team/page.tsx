import { getAdminProfile, getAdminUsers } from "@/actions/settings";
import { ProfileForm } from "./profile-form";
import { TeamList } from "./team-list";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const profile = await getAdminProfile();
  
  // Security: Only Owners can access full team management
  // We allow employees to see their own profile but not the team list
  // Actually, let's keep the profile part but guard the whole page if it's "Team"
  // If we want employees to manage profile, they should stay here but see no list.
  // But wait, the spec says Employees can't access account management settings.
  // Profile is okay, but staff management isn't.
  
  const team = profile?.role === "OWNER" ? await getAdminUsers() : [];

  return (

    <div className="flex flex-col gap-10">
      {/* My Profile Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] font-medium text-text-primary">Personal Profile</h2>
          <p className="text-[12px] text-text-muted">Manage your own administrative account details and security.</p>
        </div>
        <ProfileForm profile={profile} />
      </section>

      {/* Team Management Section (Owner Only) */}
      {profile?.role === "OWNER" && (
        <section className="flex flex-col gap-6 pt-10 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-medium text-text-primary">Team Management</h2>
              <p className="text-[12px] text-text-muted">Create and manage access for your employees.</p>
            </div>
          </div>
          <TeamList admins={team} />
        </section>
      )}
    </div>
  );
}
