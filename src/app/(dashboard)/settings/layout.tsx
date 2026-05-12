"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { 
  IconBuildingStore, 
  IconUsers, 
  IconTruck, 
  IconCreditCard, 
  IconBell, 
  IconReceiptTax,
  IconDownload
} from "@tabler/icons-react";

const settingsNav = [
  { name: "General", href: "/settings", icon: IconBuildingStore },
  { name: "Team", href: "/settings/team", icon: IconUsers },
  { name: "Shipping", href: "/settings/shipping", icon: IconTruck },
  { name: "Payments", href: "/settings/payments", icon: IconCreditCard },
  { name: "Notifications", href: "/settings/notifications", icon: IconBell },
  { name: "Tax", href: "/settings/tax", icon: IconReceiptTax },
  { name: "Exports", href: "/settings/exports", icon: IconDownload },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("EMPLOYEE");

  // Fetch role on mount
  useEffect(() => {
    async function getRole() {
      const res = await fetch("/api/auth/role");
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
      }
    }
    getRole();
  }, []);

  const filteredNav = settingsNav.filter(item => {
    if (role === "OWNER") return true;
    // Employees can only see General, Shipping, and Notifications
    return ["General", "Shipping", "Notifications"].includes(item.name);
  });

  return (
    <div className="p-[24px] md:p-[32px] w-full max-w-[1200px] mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[20px] font-medium text-text-primary tracking-tight">Settings</h1>
        <p className="text-[12px] text-text-muted">Configure your store, manage your team, and set up your business rules.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-[200px] flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {filteredNav.map((item) => {

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-[8px] rounded-[7px] text-[13px] transition-all whitespace-nowrap ${
                    isActive 
                      ? "bg-bg-secondary text-text-primary border border-border-default shadow-sm" 
                      : "text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-transparent"
                  }`}
                >
                  <item.icon size={18} stroke={1.5} className={isActive ? "text-text-primary" : "text-text-muted"} />
                  <span className={isActive ? "font-medium" : "font-normal"}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 max-w-[700px]">
          {children}
        </div>
      </div>
    </div>
  );
}
