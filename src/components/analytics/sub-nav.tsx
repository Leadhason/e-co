"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconChartBar, 
  IconBox, 
  IconShoppingBag, 
  IconUsers 
} from "@tabler/icons-react";

const navItems = [
  { label: "Sales", href: "/analytics/sales", icon: IconChartBar, section: "Overview" },
  { label: "Products", href: "/analytics/products", icon: IconBox, section: "Performance" },
  { label: "Orders", href: "/analytics/orders", icon: IconShoppingBag, section: "Performance" },
  { label: "Customers", href: "/analytics/customers", icon: IconUsers, section: "Audience" },
];

export function AnalyticsSubNav() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] flex-shrink-0 bg-bg-tertiary border-r border-border-default py-6 flex flex-col gap-1 overflow-y-auto">
      <div className="px-5 mb-4">
        <h2 className="text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider">Reports</h2>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <div key={item.href}>
              {/* Optional Section Divider */}
              {item.label === "Products" && (
                 <div className="px-5 mt-6 mb-2">
                   <h2 className="text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider">Analysis</h2>
                 </div>
              )}
              
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 mx-3 px-3 py-2 rounded-[7px] text-[13px] transition-all group ${
                  isActive 
                    ? "bg-bg-subtle text-text-primary font-medium border-r-2 border-text-primary rounded-r-none -mr-[1px]" 
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <item.icon size={16} stroke={isActive ? 2 : 1.5} className={isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
