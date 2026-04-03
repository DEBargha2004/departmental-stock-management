import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "Debargha Saha",
    email: "",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15",
  },
  {
    id: "2",
    name: "Riya Sharma",
    email: "[EMAIL_ADDRESS]",
    role: "Editor",
    status: "Active",
    lastLogin: "2024-01-14",
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "[EMAIL_ADDRESS]",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2024-01-10",
  },
  {
    id: "4",
    name: "Priya Singh",
    email: "[EMAIL_ADDRESS]",
    role: "Editor",
    status: "Active",
    lastLogin: "2024-01-13",
  },
  {
    id: "5",
    name: "Vikram Malhotra",
    email: "[EMAIL_ADDRESS]",
    role: "Viewer",
    status: "Active",
    lastLogin: "2024-01-12",
  },
];

const pageLimits = [5, 10, 20, 50];
const statuses = ["Active", "Inactive"];

export default function UsersPage() {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate pagination
  const maxPage = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  type User = (typeof mockUsers)[0];

  const handleAddUser = () => {
    // Handle add user logic here
    console.log("Add user");
  };

  const handleEditUser = (user: User) => {
    // Handle edit user logic here
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    // Handle delete user logic here
    console.log("Delete user:", user);
  };

  const handleViewUser = (user: User) => {
    // Handle view user logic here
    console.log("View user:", user);
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
        <Button
          onClick={handleAddUser}
          className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Add User</span>
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
            placeholder="Search users..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[130px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[130px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
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
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Status
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Last Login
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
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
                    <Badge
                      variant="secondary"
                      className={`font-medium text-xs px-2 py-0.5 rounded-md bg-opacity-15 ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                          : user.role === "Editor"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                      }`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-neutral-400"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteUser(user)}
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
            {filteredUsers.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredUsers.length)} of{" "}
            {filteredUsers.length}
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
          </Button>
        </div>
      </div>
    </div>
  );
}
