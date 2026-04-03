import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Activity, Eye } from "lucide-react";
import { useState } from "react";

// Mock activity log data
const mockLogs = [
  {
    id: "LOG-001",
    user: "Sarah Mitchell",
    email: "sarah.m@example.com",
    action: "Updated Stock Quantity",
    target: "MacBook Pro M3 (ITM-1004)",
    timestamp: "Today, 14:23",
    status: "Success",
    type: "Update",
  },
  {
    id: "LOG-002",
    user: "System",
    email: "system@internal.app",
    action: "Low Stock Alert Triggered",
    target: "Ergonomic Office Chair (ITM-1021)",
    timestamp: "Today, 10:15",
    status: "Warning",
    type: "System",
  },
  {
    id: "LOG-003",
    user: "David Chen",
    email: "david.c@example.com",
    action: "Created Vendor Profile",
    target: "TechData Distributors",
    timestamp: "Yesterday, 16:45",
    status: "Success",
    type: "Create",
  },
  {
    id: "LOG-004",
    user: "Elena Rodriguez",
    email: "elena.r@example.com",
    action: "Deleted Invoice",
    target: "INV-2024-03-01",
    timestamp: "Yesterday, 11:30",
    status: "Failed",
    type: "Delete",
  },
  {
    id: "LOG-005",
    user: "System",
    email: "system@internal.app",
    action: "Automated Backup Completed",
    target: "Database Server",
    timestamp: "2024-03-24, 03:00",
    status: "Success",
    type: "System",
  },
];

const pageLimits = [5, 10, 20, 50];
const statuses = ["Success", "Warning", "Failed"];
const typesList = ["All Actions", "Create", "Update", "Delete", "System"];

type ActivityLog = (typeof mockLogs)[0];

export default function ActivityLogPage() {
  const [logs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || log.status.toLowerCase() === statusFilter;
    const matchesType =
      typeFilter === "all" || log.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const maxPage = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const paginatedLogs = filteredLogs.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleViewLog = (log: ActivityLog) => {
    console.log("View log details:", log);
  };

  // Helper for status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-emerald-500";
      case "Warning":
        return "bg-amber-500";
      case "Failed":
        return "bg-destructive";
      default:
        return "bg-neutral-400";
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor system events, user actions, and automated protocols.
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm bg-transparent border-input/60 hover:bg-muted text-foreground"
        >
          <Activity className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium text-foreground">Export Logs</span>
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search users, actions, or targets..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent position="popper">
              {typesList.map((type) => {
                if (type === "All Actions")
                  return (
                    <SelectItem key="all" value="all">
                      All Actions
                    </SelectItem>
                  );
                return (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[140px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11 w-1/4">
                User
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Action
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Target / Entity
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Timestamp
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Status
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-medium text-sm">{log.user}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {log.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">
                    {log.action}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {log.target}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                          log.status,
                        )}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {log.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewLog(log)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-muted-foreground border-input/40"
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Search
                      className="h-6 w-6 text-muted-foreground/50 mb-2"
                      strokeWidth={1.5}
                    />
                    <p>No log entries found matching your criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Page Limit Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground py-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-muted-foreground/80">
            Rows per page
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-7 w-fit gap-1.5 bg-transparent border-0 shadow-none focus:ring-0 text-foreground font-medium p-1 px-2 hover:bg-muted/50 rounded transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {pageLimits.map((limit) => (
                <SelectItem key={limit} value={limit.toString()}>
                  {limit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-4 w-px bg-input/40 mx-2" />
          <span className="font-medium">
            {filteredLogs.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredLogs.length)} of{" "}
            {filteredLogs.length}
          </span>
        </div>

        <div className="flex items-center gap-1 border border-input/40 rounded-lg p-0.5 bg-card shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </Button>
          <div className="flex items-center justify-center min-w-10 font-medium text-foreground tabular-nums">
            {safePage} / {maxPage}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={safePage === maxPage}
            onClick={() => setCurrentPage((p) => Math.min(maxPage, p + 1))}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
