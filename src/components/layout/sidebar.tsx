"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconLayoutDashboard, 
  IconBox, 
  IconUsers, 
  IconSettings,
  IconReceipt,
  IconChevronDown
} from "@tabler/icons-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: IconLayoutDashboard },
    ]
  },
  {
    label: "Management",
    items: [
      { name: "Products", href: "/products", icon: IconBox },
      { name: "Categories", href: "/categories", icon: IconBox },
      { name: "Orders", href: "/orders", icon: IconReceipt },
      { name: "Customers", href: "/customers", icon: IconUsers },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] flex-shrink-0 bg-bg-secondary border-r border-border-default flex flex-col h-full">
      {/* Workspace Switcher Header */}
      <div className="h-[56px] border-b border-border-default flex items-center px-4 cursor-pointer hover:bg-bg-tertiary transition-colors">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-text-primary rounded-[4px] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="8" height="2" fill="white"/>
                <rect x="2" y="7" width="8" height="2" fill="white"/>
              </svg>
            </div>
            <span className="text-[13px] font-medium text-text-primary">StoneBase Inc.</span>
          </div>
          <IconChevronDown size={14} className="text-text-muted" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{group.label}</span>
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-[7px] rounded-[6px] text-[13px] transition-colors ${
                        isActive
                          ? "bg-bg-primary text-text-primary border border-border-default" 
                          : "text-text-secondary border border-transparent hover:bg-[#E8E6E1] hover:text-text-primary"
                      }`}
                    >
                      <item.icon size={16} stroke={1.5} className={isActive ? "text-text-primary" : "text-text-muted"} />
                      <span className={isActive ? "font-medium" : "font-normal"}>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-border-default">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-3 py-[7px] rounded-[6px] text-[13px] text-text-secondary hover:bg-[#E8E6E1] hover:text-text-primary transition-colors mb-1"
        >
          <IconSettings size={16} stroke={1.5} className="text-text-muted" />
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-[6px] cursor-pointer hover:bg-[#E8E6E1] transition-colors">
           <div className="w-6 h-6 rounded-full bg-border-strong flex items-center justify-center text-[10px] font-medium text-text-primary">
             DJ
           </div>
           <div className="flex flex-col">
             <span className="text-[12px] font-medium text-text-primary leading-tight">Admin User</span>
             <span className="text-[11px] text-text-muted leading-tight">admin@stonebase.com</span>
           </div>
        </div>
      </div>
    </aside>
  );
}