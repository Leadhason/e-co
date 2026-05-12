"use client";

import { useState, useRef, useEffect } from "react";
import { IconBell, IconChevronDown, IconUser, IconMenu2, IconCheck, IconCircleFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathParts = pathname?.split("/").filter(Boolean) || [];
  const currentPage = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) 
    : "Overview";

  const notifications = [
    { id: 1, title: "New Order #1042", time: "2m ago", type: "order" },
    { id: 2, title: "Low Stock: Minimalist Lamp", time: "1h ago", type: "stock" },
    { id: 3, title: "Customer Account Blocked", time: "3h ago", type: "user" },
  ];

  return (
    <header className="h-[56px] border-b border-border-default flex items-center justify-between px-[20px] md:px-[24px] bg-bg-primary z-30 sticky top-0">
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono text-text-muted">/</span>
            <span className="text-[13px] font-medium text-text-primary">{currentPage}</span>
         </div>
      </div>


      <div className="flex items-center gap-4">
        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative w-8 h-8 flex items-center justify-center rounded-[6px] transition-all ${
              showNotifications ? "bg-bg-secondary text-text-primary" : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
            }`}
          >
            <IconBell size={18} stroke={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A32D2D] rounded-full border-2 border-bg-primary"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[300px] bg-bg-primary border border-border-default rounded-[10px] shadow-lg animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
              <div className="p-[14px] px-[16px] border-b border-border-default flex items-center justify-between bg-bg-secondary">
                <span className="text-[12px] font-medium text-text-primary">Notifications</span>
                <button className="text-[10px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
                  <IconCheck size={12} />
                  Mark all read
                </button>
              </div>
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div key={n.id} className="p-[14px] px-[16px] border-b border-border-subtle last:border-b-0 hover:bg-bg-tertiary transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0`}>
                        <IconCircleFilled size={8} className={n.type === 'stock' ? 'text-[#A32D2D]' : 'text-[#185FA5]'} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] text-text-primary font-medium group-hover:text-text-primary transition-colors">{n.title}</span>
                        <span className="text-[11px] text-text-muted font-mono">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-border-default">
                <button className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">View all activity</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-border-default mx-1"></div>

        {/* Profile Button */}
        <Link 
          href="/settings"
          className="flex items-center gap-2.5 p-1 pr-2 rounded-[7px] hover:bg-bg-secondary transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-bg-tertiary border border-border-strong flex items-center justify-center text-text-muted group-hover:border-text-hint transition-all overflow-hidden">
            <div className="bg-text-muted w-full h-full flex items-center justify-center text-[10px] text-white">DJ</div>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-text-primary leading-tight">Admin User</span>
            <span className="text-[10px] text-text-muted leading-tight">admin@stonebase.com</span>
          </div>
          <IconChevronDown size={14} className="text-text-muted ml-1" />
        </Link>
      </div>
    </header>
  );
}

