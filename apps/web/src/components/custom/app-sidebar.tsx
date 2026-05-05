import { getSidebarItems, sidebarItems } from "@/constants/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useGetAccessListQuery } from "@/controllers/main/query";
import { Skeleton } from "../ui/skeleton";

export default function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: moduleAccessList, isLoading } = useGetAccessListQuery();
  const dataList = moduleAccessList?.data.data;
  const handleLogout = () => {
    logout();
    navigate("/auth/sign-in");
  };
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <SidebarMenuItem key={idx} title={""}>
                      <SidebarMenuButton>
                        <SidebarMenuSkeleton />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                : getSidebarItems(dataList ?? []).map((si) => (
                    <SidebarMenuItem key={si.id} title={si.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={si.isActive(location.pathname)}
                      >
                        <Link to={si.href}>
                          <si.icon />
                          <span>{si.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
