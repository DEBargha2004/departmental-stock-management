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

// Mock category data
const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    description: "Computers, laptops, monitors, and related accessories.",
    itemsCount: 450,
    status: "Active",
    lastUpdated: "2024-03-12",
  },
  {
    id: "2",
    name: "Furniture",
    description: "Office chairs, desks, filing cabinets, and tables.",
    itemsCount: 320,
    status: "Active",
    lastUpdated: "2024-03-10",
  },
  {
    id: "3",
    name: "Stationery",
    description: "Pens, notebooks, printer paper, and general supplies.",
    itemsCount: 850,
    status: "Active",
    lastUpdated: "2024-03-14",
  },
  {
    id: "4",
    name: "Accessories",
    description: "Mice, keyboards, adapters, and cables.",
    itemsCount: 230,
    status: "Active",
    lastUpdated: "2024-03-13",
  },
  {
    id: "5",
    name: "Legacy Hardware",
    description: "Outdated hardware preserved for compatibility or archives.",
    itemsCount: 45,
    status: "Inactive",
    lastUpdated: "2023-11-20",
  },
];

const pageLimits = [5, 10, 20, 50];
const statuses = ["Active", "Inactive"];

export default function CategoriesPage() {
  const [categories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter categories based on search and filters
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || category.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const maxPage = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const paginatedCategories = filteredCategories.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  type Category = (typeof mockCategories)[0];

  const handleAddCategory = () => {
    console.log("Add category");
  };

  const handleEditCategory = (category: Category) => {
    console.log("Edit category:", category);
  };

  const handleDeleteCategory = (category: Category) => {
    console.log("Delete category:", category);
  };

  const handleViewCategory = (category: Category) => {
    console.log("View category:", category);
  };

  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Manage Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and classify inventory into manageable categories.
          </p>
        </div>
        <Button
          onClick={handleAddCategory}
          className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Add Category</span>
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
            placeholder="Search categories..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
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

      {/* Categories Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Category Name
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Description
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Items count
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Status
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Last Updated
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {category.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    {category.itemsCount}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          category.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-neutral-400"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {category.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {category.lastUpdated}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewCategory(category)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCategory(category)}
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
                    <p>No categories found matching your criteria</p>
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
            {filteredCategories.length === 0
              ? 0
              : (safePage - 1) * pageSize + 1}
            –{Math.min(safePage * pageSize, filteredCategories.length)} of{" "}
            {filteredCategories.length}
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
