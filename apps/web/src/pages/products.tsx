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

// Mock products data
const mockProducts = [
  {
    id: "1",
    sku: "ITM-1004",
    name: "MacBook Pro M3",
    category: "Electronics",
    quantity: 45,
    price: "$1,999.00",
    status: "In Stock",
    lastUpdated: "2024-03-24",
  },
  {
    id: "2",
    sku: "ITM-1005",
    name: "Dell UltraSharp Monitor",
    category: "Electronics",
    quantity: 12,
    price: "$699.00",
    status: "In Stock",
    lastUpdated: "2024-03-22",
  },
  {
    id: "3",
    sku: "ITM-1021",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    quantity: 8,
    price: "$250.00",
    status: "Low Stock",
    lastUpdated: "2024-03-20",
  },
  {
    id: "4",
    sku: "ITM-1033",
    name: "Logitech MX Master 3S",
    category: "Accessories",
    quantity: 3,
    price: "$99.00",
    status: "Low Stock",
    lastUpdated: "2024-03-25",
  },
  {
    id: "5",
    sku: "ITM-1042",
    name: "Printer Paper (A4)",
    category: "Stationery",
    quantity: 0,
    price: "$15.00",
    status: "Out of Stock",
    lastUpdated: "2024-03-10",
  },
];

const pageLimits = [5, 10, 20, 50];
const statuses = ["In Stock", "Low Stock", "Out of Stock"];
const categoriesList = [
  "Electronics",
  "Furniture",
  "Stationery",
  "Accessories",
];

type Product = (typeof mockProducts)[0];

export default function ProductsPage() {
  const [products] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status.toLowerCase() === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate pagination
  const maxPage = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleAddProduct = () => {
    console.log("Add product");
  };

  const handleEditProduct = (product: Product) => {
    console.log("Edit product:", product);
  };

  const handleDeleteProduct = (product: Product) => {
    console.log("Delete product:", product);
  };

  const handleViewProduct = (product: Product) => {
    console.log("View product:", product);
  };

  // Helper for status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-500";
      case "Low Stock":
        return "bg-amber-500";
      case "Out of Stock":
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
            Manage Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage individual inventory products, assets, and levels.
          </p>
        </div>
        <Button
          onClick={handleAddProduct}
          className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Add Product</span>
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
            placeholder="Search by name or SKU..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesList.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
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

      {/* Products Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Product Details
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Category
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Quantity
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Price
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Status
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-medium text-sm">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.sku}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {product.category}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {product.price}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                          product.status,
                        )}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {product.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteProduct(product)}
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
                    <p>No products found matching your criteria</p>
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
            {filteredProducts.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length}
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
