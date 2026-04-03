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
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState } from "react";

// Mock vendors data
const mockVendors = [
  {
    id: "1",
    name: "TechData Distributors",
    contactPerson: "Sarah Mitchell",
    email: "sarah@techdata.example.com",
    phone: "+1 (555) 123-4567",
    type: "Hardware",
    status: "Active",
    lastOrder: "2024-03-15",
  },
  {
    id: "2",
    name: "Global Office Supplies",
    contactPerson: "David Chen",
    email: "david.c@globaloffice.example.com",
    phone: "+1 (555) 987-6543",
    type: "Stationery",
    status: "Active",
    lastOrder: "2024-03-20",
  },
  {
    id: "3",
    name: "ErgoFit Workspaces",
    contactPerson: "Marcus Johnson",
    email: "orders@ergofit.example.com",
    phone: "+1 (555) 456-7890",
    type: "Furniture",
    status: "Active",
    lastOrder: "2024-02-28",
  },
  {
    id: "4",
    name: "CloudSys Logistics",
    contactPerson: "Elena Rodriguez",
    email: "elena@cloudsys.example.com",
    phone: "+1 (555) 234-5678",
    type: "Services",
    status: "Pending",
    lastOrder: "N/A",
  },
  {
    id: "5",
    name: "Alpha Corp Hardware",
    contactPerson: "Thomas Miller",
    email: "t.miller@alphacorp.example.com",
    phone: "+1 (555) 345-6789",
    type: "Hardware",
    status: "Inactive",
    lastOrder: "2023-11-10",
  },
];

const pageLimits = [5, 10, 20, 50];
const statuses = ["Active", "Inactive", "Pending"];
const typesList = [
  "All Types",
  "Hardware",
  "Stationery",
  "Furniture",
  "Services",
];

type Vendor = (typeof mockVendors)[0];

export default function VendorsPage() {
  const [vendors] = useState(mockVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter vendors based on search and filters
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vendor.status.toLowerCase() === statusFilter;
    const matchesType =
      typeFilter === "all" || vendor.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const maxPage = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const paginatedVendors = filteredVendors.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleAddVendor = () => {
    console.log("Add vendor");
  };

  const handleEditVendor = (vendor: Vendor) => {
    console.log("Edit vendor:", vendor);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    console.log("Delete vendor:", vendor);
  };

  const handleViewVendor = (vendor: Vendor) => {
    console.log("View vendor:", vendor);
  };

  // Helper for status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500";
      case "Pending":
        return "bg-amber-500";
      case "Inactive":
        return "bg-neutral-400";
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
            Manage Vendors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Maintain supplier relationships, contacts, and performance metrics.
          </p>
        </div>
        <Button
          onClick={handleAddVendor}
          className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm"
        >
          <Building2 className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Add Vendor</span>
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
            placeholder="Search providers, contacts, or emails..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent position="popper">
              {typesList.map((type) => {
                if (type === "All Types")
                  return (
                    <SelectItem key="all" value="all">
                      All Types
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

      {/* Vendors Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Vendor
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Contact
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Type
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Status
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Last Order
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVendors.length > 0 ? (
              paginatedVendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="py-3">
                    <span className="font-medium text-sm">{vendor.name}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-sm">{vendor.contactPerson}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {vendor.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {vendor.type}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                          vendor.status,
                        )}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {vendor.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {vendor.lastOrder}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewVendor(vendor)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditVendor(vendor)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteVendor(vendor)}
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
                    <p>No vendors found matching your criteria</p>
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
            {filteredVendors.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredVendors.length)} of{" "}
            {filteredVendors.length}
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
