import type { TSidebarItem } from "@/types/sidebar-item";
import {
  Box,
  Boxes,
  LayoutDashboard,
  ScrollText,
  Store,
  UsersRound,
} from "lucide-react";

export const sidebarItems: TSidebarItem[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "users",
    icon: UsersRound,
    label: "Users",
    href: "/users",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "categories",
    icon: Boxes,
    label: "Categories",
    href: "/categories",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "products",
    icon: Box,
    label: "Products",
    href: "/products",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "vendors",
    icon: Store,
    label: "Vendors",
    href: "/vendors",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "activity-log",
    icon: ScrollText,
    label: "Activity Log",
    href: "/activity-log",
    isActive(path) {
      return path === this.href;
    },
  },
];
