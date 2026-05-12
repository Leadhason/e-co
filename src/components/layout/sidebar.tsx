"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconLayoutDashboard, 
  IconBox, 
  IconUsers, 
  IconSettings,
  IconReceipt,
  IconChevronDown,
  IconLayoutSidebar
} from "@tabler/icons-react";
import { useSidebar } from "./sidebar-context";

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
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside 
      className={`bg-bg-secondary border-r border-border-default flex flex-col h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Workspace Switcher Header */}
      <div className="h-[56px] border-b border-border-default flex items-center px-4 overflow-hidden whitespace-nowrap">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-5 h-5 bg-text-primary rounded-[4px] flex-shrink-0 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="8" height="2" fill="white"/>
                <rect x="2" y="7" width="8" height="2" fill="white"/>
              </svg>
            </div>
            {!isCollapsed && <span className="text-[14px] font-serif font-medium text-text-primary">StoneBase</span>}
          </div>
          
          <button 
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-[6px] transition-all flex-shrink-0"
          >
            <IconLayoutSidebar size={20} stroke={1.5} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6 overflow-x-hidden">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className={`px-3 mb-2 h-4 flex items-center transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
              {!isCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">{group.label}</span>}
            </div>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.name : ""}
                      className={`flex items-center gap-3 px-3 py-[8px] rounded-[6px] text-[13px] transition-all relative group ${
                        isActive
                          ? "bg-bg-primary text-text-primary border border-border-default shadow-sm" 
                          : "text-text-secondary border border-transparent hover:bg-[#E8E6E1] hover:text-text-primary"
                      }`}
                    >
                      <item.icon size={20} stroke={1.5} className={`flex-shrink-0 ${isActive ? "text-text-primary" : "text-text-muted"}`} />
                      {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.name}</span>}
                    </Link>

                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-default">
        <Link 
          href="/settings"
          title={isCollapsed ? "Settings" : ""}
          className={`flex items-center gap-3 px-3 py-[8px] rounded-[6px] text-[13px] transition-all ${
            pathname === "/settings" 
              ? "bg-bg-primary text-text-primary border border-border-default shadow-sm" 
              : "text-text-secondary border border-transparent hover:bg-[#E8E6E1] hover:text-text-primary"
          }`}
        >
          <IconSettings size={20} stroke={1.5} className={`flex-shrink-0 ${pathname === "/settings" ? "text-text-primary" : "text-text-muted"}`} />
          {!isCollapsed && <span className="whitespace-nowrap font-medium">Settings</span>}
        </Link>
      </div>
    </aside>



  );
}