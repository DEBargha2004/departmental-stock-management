import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  HandCoins,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Mock Data
const categoryData = [
  { category: "Electronics", items: 450, fill: "hsl(var(--chart-1))" },
  { category: "Furniture", items: 320, fill: "hsl(var(--chart-2))" },
  { category: "Stationery", items: 850, fill: "hsl(var(--chart-3))" },
  { category: "Accessories", items: 230, fill: "hsl(var(--chart-4))" },
];

const topItems = [
  { name: "A4 Paper Reams", quantity: 124, trend: "up" },
  { name: "Wireless Mice", quantity: 45, trend: "up" },
  { name: "Ergonomic Chairs", quantity: 28, trend: "down" },
  { name: "Monitor Stands", quantity: 22, trend: "up" },
];

const inventoryData = [
  { month: "Jan", stockLevel: 2400, value: 4000 },
  { month: "Feb", stockLevel: 1398, value: 3000 },
  { month: "Mar", stockLevel: 3800, value: 6000 },
  { month: "Apr", stockLevel: 3908, value: 6500 },
  { month: "May", stockLevel: 4800, value: 8000 },
  { month: "Jun", stockLevel: 3800, value: 6500 },
  { month: "Jul", stockLevel: 4300, value: 7000 },
];

const recentActivity = [
  {
    id: 1,
    action: "Stock Restocked",
    item: "MacBook Pro M3",
    quantity: "+50",
    date: "Today, 10:45 AM",
    status: "Completed",
  },
  {
    id: 2,
    action: "Dispatched",
    item: "Dell UltraSharp Monitors",
    quantity: "-12",
    date: "Today, 09:12 AM",
    status: "Completed",
  },
  {
    id: 3,
    action: "Low Stock Alert",
    item: "Logitech MX Master 3S",
    quantity: "3 left",
    date: "Yesterday",
    status: "Warning",
  },
  {
    id: 4,
    action: "Stock Restocked",
    item: "Ergonomic Chairs",
    quantity: "+20",
    date: "Yesterday",
    status: "Completed",
  },
];

const chartConfig = {
  stockLevel: {
    label: "Total Units",
    color: "hsl(var(--primary))",
  },
  items: {
    label: "Items in Stock",
    color: "hsl(var(--primary))",
  },
};

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of departmental inventory, stock trends, and recent asset
            movements.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border-input/40 shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
            <Package
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">12,543</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" /> 12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-input/40 shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle
              className="h-4 w-4 text-amber-500"
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight text-amber-600 dark:text-amber-500">
              24
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-destructive flex items-center">
                <ArrowUpRight className="h-3 w-3" /> 4
              </span>
              new alerts today
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-input/40 shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Value
            </CardTitle>
            <HandCoins
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">$845.2k</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" /> 2.1%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-input/40 shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dispatched Today
            </CardTitle>
            <TrendingUp
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">142</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-muted-foreground flex items-center">
                <ArrowDownRight className="h-3 w-3" /> 12%
              </span>
              from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="col-span-1 lg:col-span-2 rounded-xl border-input/40 shadow-sm bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Stock Level Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={inventoryData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-stockLevel)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-stockLevel)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="stockLevel"
                    stroke="var(--color-stockLevel)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStock)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-xl border-input/40 shadow-sm bg-card overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6 pb-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="mt-1.5">
                    <div
                      className={`h-2 w-2 rounded-full ${activity.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.item}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs font-medium">
                      <span
                        className={`${activity.quantity.startsWith("+") ? "text-emerald-500" : activity.quantity.startsWith("-") ? "text-blue-500" : "text-amber-500"}`}
                      >
                        {activity.quantity}
                      </span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="text-muted-foreground">
                        {activity.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <Card className="col-span-1 lg:col-span-2 rounded-xl border-input/40 shadow-sm bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Stock Distribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width={100} height={100}>
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    width={90}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="items"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Moving Items */}
        <Card className="rounded-xl border-input/40 shadow-sm bg-card overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Fastest Moving Items
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6 pb-2">
              {topItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      {item.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-destructive" />
                      )}
                      <span>vs last week</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold px-2.5 py-0.5 rounded-md bg-muted text-foreground">
                    {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
