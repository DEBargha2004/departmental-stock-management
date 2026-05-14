import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAccessListQuery } from "@/controllers/main/query";
import { cn } from "@/lib/utils";
import { Package, LayoutDashboard, History, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function WelcomePage() {
  const { data: accessList } = useGetAccessListQuery();
  const dataList = accessList?.data.data ?? [];

  return (
    <div className="@container w-full flex flex-col items-center justify-center space-y-8 py-16 px-4 md:py-24 min-h-[calc(100vh-4rem)]">
      {/* Header section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
          <Package className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Welcome to <span className="text-primary">Stock Management</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Streamline your departmental inventory, track asset allocations, and
            monitor stock trends effortlessly in one unified platform.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className={cn(
          "flex gap-6 @2xl:flex-nowrap flex-wrap w-full max-w-5xl mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both",
          "[&>div]:w-full",
        )}
      >
        {dataList.includes("dashboard") && (
          <Card className="rounded-2xl border-input/40 shadow-sm bg-card hover:bg-accent/30 hover:border-primary/30 hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden relative">
            <Link to="/dashboard" className="block h-full relative z-10">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  Dashboard
                </CardTitle>
                <CardDescription className="text-[15px] mt-2">
                  View KPIs, stock levels, and departmental overview.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-semibold text-primary mt-4 group-hover:translate-x-1 transition-transform">
                  Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        )}

        {dataList.includes("products") && (
          <Card className="rounded-2xl border-input/40 shadow-sm bg-card hover:bg-accent/30 hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden relative">
            <Link to="/products" className="block h-full relative z-10">
              <CardHeader>
                <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Package className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  Inventory Catalog
                </CardTitle>
                <CardDescription className="text-[15px] mt-2">
                  Browse, add, or update products and catalog items.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-500 mt-4 group-hover:translate-x-1 transition-transform">
                  Manage Inventory <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        )}

        {dataList.includes("activity_log") && (
          <Card className="rounded-2xl border-input/40 shadow-sm bg-card hover:bg-accent/30 hover:border-blue-500/30 hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden relative">
            <Link to="/activity-log" className="block h-full relative z-10">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                  <History className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  Activity Logs
                </CardTitle>
                <CardDescription className="text-[15px] mt-2">
                  Track recent asset movements and detailed system audits.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-500 mt-4 group-hover:translate-x-1 transition-transform">
                  View Logs <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        )}
      </div>
    </div>
  );
}
