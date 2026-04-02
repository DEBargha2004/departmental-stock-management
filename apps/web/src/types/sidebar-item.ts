import type { IconType } from "react-icons";

export type TSidebarItem = {
  id: string;
  icon: IconType;
  label: string;
  href: string;
  isActive: (path: string) => boolean;
};
