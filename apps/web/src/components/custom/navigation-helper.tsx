import { useEffect } from "react";
import { useLocation } from "react-router";
import { useSidebar } from "../ui/sidebar";

export default function NavigationHelper() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  return null;
}
