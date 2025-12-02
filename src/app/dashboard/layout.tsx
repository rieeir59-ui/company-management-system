'use client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { FirebaseClientProvider } from "@/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <Header />
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
