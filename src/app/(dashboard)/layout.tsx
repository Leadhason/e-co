import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-bg-primary overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-bg-primary overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
