import type { TSidebarItem } from "@/types/sidebar-item";
import type { MODULE } from "@repo/contracts/module";
import {
  Box,
  Boxes,
  FileBox,
  LayoutDashboard,
  Package,
  ScrollText,
  Store,
  UsersRound,
  ClipboardList,
  RotateCcw,
} from "lucide-react";

export const sidebarItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
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
    id: "purchase_orders",
    icon: FileBox,
    label: "Purchase Orders",
    href: "/purchase-orders",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "stock_batches",
    icon: Package,
    label: "Stock Batches",
    href: "/stock-batches",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "issue_requests",
    icon: ClipboardList,
    label: "Issue Requests",
    href: "/issue-requests",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "return_requests",
    icon: RotateCcw,
    label: "Return Requests",
    href: "/return-requests",
    isActive(path) {
      return path === this.href;
    },
  },
  {
    id: "activity_log",
    icon: ScrollText,
    label: "Activity Log",
    href: "/activity-log",
    isActive(path) {
      return path === this.href;
    },
  },
] as const satisfies TSidebarItem[];

export const getSidebarItems = (list: MODULE[]) => {
  return sidebarItems.filter((item) => list.includes(item.id));
};
