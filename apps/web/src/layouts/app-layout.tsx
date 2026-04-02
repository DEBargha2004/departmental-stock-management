import AppNavbar from "@/components/custom/app-navbar";
import AppSidebar from "@/components/custom/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <div className="w-full">
          <AppNavbar />
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
