import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Activity, Eye, User, Database, FileText } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetAuditLogsQuery } from "@/controllers/audit/query";
import {
  AUDIT_ACTION_FORMATTED,
  ENTITY_TYPE_FORMATTED,
  type AUDIT_ACTION,
  type ENTITY_TYPE,
} from "@repo/contracts/status";
import { formatDate } from "@/lib/utils";
import type { TAuditLog } from "@repo/contracts/audit";
import { ActionBadge } from "./_components/action-badge";
import PermissionChecker from "@/components/custom/permission-checker";
import { PERMISSIONS } from "@repo/contracts/permission";

const pageLimits = [10, 20, 30, 40, 50];

export default function ActivityLogPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    action: parseAsString.withDefault("all"),
    entity: parseAsString.withDefault("all"),
    limit: parseAsInteger.withDefault(20),
    page: parseAsInteger.withDefault(1),
  });

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const { data: auditResponse, isLoading } = useGetAuditLogsQuery({
    query: debouncedQuery,
    action:
      searchParams.action !== "all"
        ? (searchParams.action as AUDIT_ACTION)
        : undefined,
    entity:
      searchParams.entity !== "all"
        ? (searchParams.entity as ENTITY_TYPE)
        : undefined,
    limit: searchParams.limit,
    page: searchParams.page,
  });

  const dataList = auditResponse?.data?.data;
  const logs = dataList?.list ?? [];
  const totalCount = dataList?.count ?? 0;

  // Pagination logic
  const firstPage = 1;
  const lastPage = Math.max(1, Math.ceil(totalCount / searchParams.limit));
  const prevPage = Math.max(firstPage, searchParams.page - 1);
  const nextPage = Math.min(lastPage, searchParams.page + 1);

  const recordStart =
    totalCount > 0 ? (searchParams.page - 1) * searchParams.limit + 1 : 0;
  const recordEnd = Math.min(
    searchParams.page * searchParams.limit,
    totalCount,
  );

  const handleViewLog = (log: TAuditLog) => {
    console.log("View log details:", log);
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
        <PermissionChecker requiredPermissions={[PERMISSIONS.AUDIT_READ]}>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm bg-transparent border-input/60 hover:bg-muted text-foreground"
          >
            <Activity className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium text-foreground">Export Logs</span>
          </Button>
        </PermissionChecker>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
        <div className="relative col-span-1 lg:col-span-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search descriptions, users..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query || ""}
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                query: e.target.value,
                page: 1,
              })
            }
          />
        </div>

        <Select
          value={searchParams.action}
          onValueChange={(val) =>
            setSearchParams({ ...searchParams, action: val, page: 1 })
          }
        >
          <SelectTrigger className="h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Actions</SelectItem>
            {AUDIT_ACTION_FORMATTED.map((action) => (
              <SelectItem key={action.id} value={action.id}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.entity}
          onValueChange={(val) =>
            setSearchParams({ ...searchParams, entity: val, page: 1 })
          }
        >
          <SelectTrigger className="h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Entities</SelectItem>
            {ENTITY_TYPE_FORMATTED.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Table */}
      <PermissionChecker requiredPermissions={[PERMISSIONS.AUDIT_READ]}>
        <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                  User
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                  Action
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                  Entity
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                  Description
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                  Timestamp
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-input/40">
                    <TableCell className="py-3">
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="group hover:bg-muted/40 transition-colors border-input/40"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {log.user?.name || "System"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.user?.email || "system@internal"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <ActionBadge action={log.action} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Database className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="capitalize">
                          {log.entityType.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                      {log.description || "No description"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <PermissionChecker
                        requiredPermissions={[PERMISSIONS.AUDIT_READ]}
                        className="h-8 w-8"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleViewLog(log)}
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </PermissionChecker>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-64 text-center text-sm text-muted-foreground border-input/40"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                        <FileText className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="font-medium text-foreground">
                        No log entries found
                      </p>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </PermissionChecker>

      {/* Pagination & Page Limit Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground py-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-muted-foreground/80">
            Rows per page
          </span>
          <Select
            value={searchParams.limit.toString()}
            onValueChange={(val) =>
              setSearchParams({ ...searchParams, limit: Number(val), page: 1 })
            }
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
            {recordStart}-{recordEnd} of {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-1 border border-input/40 rounded-lg p-0.5 bg-card shadow-sm">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() =>
                    setSearchParams({ ...searchParams, page: prevPage })
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink className="cursor-default">
                  {searchParams.page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() =>
                    setSearchParams({ ...searchParams, page: nextPage })
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
