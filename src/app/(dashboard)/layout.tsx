import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-bg-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-bg-primary overflow-y-auto">
        {/* We can place a top header here if needed, or just yield to children. 
            For now, just yielding children directly into the main content area. */}
        {children}
      </main>
    </div>
  );
}