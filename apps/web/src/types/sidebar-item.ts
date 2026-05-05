import type { IconType } from "react-icons";
import type { MODULE } from "@repo/contracts/module";

export type TSidebarItem = {
  id: MODULE;
  icon: IconType;
  label: string;
  href: string;
  isActive: (path: string) => boolean;
};
