import { cn } from "@/lib/utils";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { AlignJustify } from "lucide-react";
import { ModeToggle } from "../ui/mode-toggle";
import AppLogo from "./app-logo";

export default function AppNavbar() {
  const { toggleSidebar } = useSidebar();
  return (
    <nav
      className={cn(
        "h-16 w-full sticky top-0 border-b px-4",
        "flex items-center justify-start gap-3 bg-background z-999",
      )}
    >
      <Button
        size={"icon"}
        variant={"outline"}
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <AlignJustify />
      </Button>
      <AppLogo />
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </nav>
  );
}
