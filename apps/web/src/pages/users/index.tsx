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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { getRoleObject, ROLES_FORMATTED } from "@repo/contracts/roles";
import RoleBadge from "./_components/role-badge";
import UserFormDialog from "./_components/form-dialog";
import { userCreateSchema, type TUserCreateSchema } from "@repo/contracts/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDefaultUserCreateValues } from "@/constants/form-defaults/user-create";
import { useCreateUserMutation } from "@/controllers/user/mutation";
import { catchError } from "@/lib/catch-error";
import { toast } from "sonner";
import { useGetAllUsersQuery } from "@/controllers/user/query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const pageLimits = [5, 10, 20, 50];

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    role: parseAsString.withDefault("all"),
    page: parseAsInteger.withDefault(1),
  });

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const form = useForm<TUserCreateSchema>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: getDefaultUserCreateValues(),
  });

  const { data: usersList, isLoading } = useGetAllUsersQuery({
    query: debouncedQuery,
    role: searchParams.role === "all" ? "" : searchParams.role,
    limit: searchParams.limit,
  });
  const { mutateAsync: createUser } = useCreateUserMutation();
  const dataList = usersList?.data.data;
  const firstPage = 1;
  const lastPage = Math.max(
    1,
    Math.floor((dataList?.count ?? 0) % searchParams.limit),
  );
  const prevPage = Math.max(firstPage, searchParams.page - 1);
  const nextPage = Math.min(lastPage, searchParams.page + 1);

  // Calculate pagination
  const maxPage = Math.max(
    1,
    Math.ceil(dataList?.list.length ?? 0 / searchParams.limit),
  );
  const safePage = Math.min(currentPage, maxPage);
  const paginatedUsers = dataList?.list.slice(
    (safePage - 1) * searchParams.limit,
    safePage * searchParams.limit,
  );

  const handleAddUser = async (data: TUserCreateSchema) => {
    const [err, res] = await catchError(createUser(data));

    if (err) return toast.error(err.message);
    toast.success(res.data.message);
    form.reset();
  };

  const handleEditUser = (userId: number) => {
    // Handle edit user logic here
    console.log("Edit user:", userId);
  };

  const handleDeleteUser = (userId: number) => {
    // Handle delete user logic here
    console.log("Delete user:", userId);
  };

  const handleViewUser = (userId: number) => {
    // Handle view user logic here
    console.log("View user:", userId);
  };

  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Manage Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions across the platform.
          </p>
        </div>
        <UserFormDialog form={form} onSubmit={handleAddUser}>
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Add User</span>
          </Button>
        </UserFormDialog>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query}
            onChange={(e) =>
              setSearchParams({ ...searchParams, query: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={searchParams.role}
            onValueChange={(e) => setSearchParams({ ...searchParams, role: e })}
          >
            <SelectTrigger className="h-9 w-full sm:w-[130px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All</SelectItem>
              {ROLES_FORMATTED.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Name
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Email
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Role
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(paginatedUsers?.length ?? 0) > 0 ? (
              paginatedUsers?.map((user) => (
                <TableRow
                  key={user.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {user.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="py-3">
                    <RoleBadge role={getRoleObject(user.role)?.id}>
                      {getRoleObject(user.role)?.label}
                    </RoleBadge>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
                    <p>No users found matching your criteria</p>
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
            value={searchParams.limit.toString()}
            onValueChange={(val) => {
              setSearchParams({ ...searchParams, limit: Number(val) });
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
            {dataList?.list.length === 0
              ? 0
              : (safePage - 1) * searchParams.limit + 1}
            –
            {Math.min(
              safePage * searchParams.limit,
              dataList?.list.length ?? 0,
            )}{" "}
            of {dataList?.count}
          </span>
        </div>

        <div className="flex items-center gap-1 border border-input/40 rounded-lg p-0.5 bg-card shadow-sm">
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </Button>
          <div className="flex items-center justify-center min-w-[2.5rem] font-medium text-foreground tabular-nums">
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
          </Button> */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>{searchParams.page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
