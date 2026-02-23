import { cn } from "@/lib/utils";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <main className={cn("min-h-dvh flex justify-center items-center")}>
      <Outlet />
    </main>
  );
}
