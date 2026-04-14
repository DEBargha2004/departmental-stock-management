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
import { Search, Edit, Trash2, Eye, Building2, Dot } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { catchError } from "@/lib/catch-error";
import { toast } from "sonner";
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
import ControlledFormDialog from "@/components/custom/controlled-form-dialog";
import { useRef } from "react";
import WarningDialog from "@/components/custom/warning-dialog";
import { STATUS_FORMATTED, type STATUS } from "@repo/contracts/status";
import {
  vendorCreateSchema,
  vendorUpdateSchema,
  type TVendorCreateSchema,
  type TVendorUpdateSchema,
} from "@repo/contracts/vendor";
import { getDefaultVendorCreateValues } from "@/constants/form-defaults/vendor";
import {
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useUpdateVendorMutation,
} from "@/controllers/vendor/mutation";
import { useGetAllVendorsQuery } from "@/controllers/vendor/query";
import CreateVendorForm from "@/components/custom/forms/vendor-create";
import { getVendorRequest } from "@/controllers/vendor/api";
import ActiveBadge from "@/components/custom/active-badge";
import { formatDate } from "@/lib/utils";

const pageLimits = [10, 20, 30, 40, 50];

export default function VendorsPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    page: parseAsInteger.withDefault(1),
    status: parseAsString.withDefault("all"),
  });
  const updateEntryButtonRef = useRef<HTMLButtonElement>(null);
  const activeUpdateVendor = useRef<number | null>(null);

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const createForm = useForm<TVendorCreateSchema>({
    resolver: zodResolver(vendorCreateSchema),
    defaultValues: getDefaultVendorCreateValues(),
  });
  const updateForm = useForm<TVendorUpdateSchema>({
    resolver: zodResolver(vendorUpdateSchema),
  });

  const { data: vendorsList, isLoading } = useGetAllVendorsQuery({
    query: debouncedQuery,
    limit: searchParams.limit,
    page: searchParams.page,
    status:
      searchParams.status === "all" ? null : (searchParams.status as STATUS),
  });
  const { mutateAsync: createVendor } = useCreateVendorMutation();
  const { mutateAsync: updateVendor } = useUpdateVendorMutation();
  const { mutateAsync: deleteVendor } = useDeleteVendorMutation();

  const dataList = vendorsList?.data.data;
  const firstPage = 1;
  const lastPage = Math.max(
    1,
    Math.ceil((dataList?.count ?? 0) / searchParams.limit),
  );
  const prevPage = Math.max(firstPage, searchParams.page - 1);
  const nextPage = Math.min(lastPage, searchParams.page + 1);

  const recordStart = dataList
    ? dataList.list.length > 0
      ? (searchParams.page - 1) * searchParams.limit + 1
      : 0
    : 0;
  const recordEnd = dataList
    ? Math.min(searchParams.page * searchParams.limit, dataList.count)
    : 0;

  const handleAddVendor = async (data: TVendorCreateSchema) => {
    await catchError(createVendor(data));
    createForm.reset();
  };

  const handleEditVendorButtonClick = async (vendorId: number) => {
    const [err, res] = await catchError(getVendorRequest({ id: vendorId }));
    if (err) return toast.error(err.message);

    const btn = updateEntryButtonRef.current;
    const { data } = res.data;
    if (btn) {
      activeUpdateVendor.current = vendorId;
      btn.click();
      updateForm.reset({
        name: data?.name ?? "",
        contactPerson: data?.contactPerson ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        address: data?.address ?? "",
      });
    }
  };

  const handleUpdateVendor = async (data: TVendorUpdateSchema) => {
    if (!activeUpdateVendor.current) return;

    await updateVendor({
      id: activeUpdateVendor.current,
      payload: data,
    });

    activeUpdateVendor.current = null;
  };

  const handleDeleteVendor = async (vendorId: number) => {
    await deleteVendor({ id: vendorId });
  };

  const handleViewVendor = (vendorId: number) => {
    console.log("View vendor:", vendorId);
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
        <ControlledFormDialog
          form={createForm}
          onSubmit={handleAddVendor}
          FormComponent={CreateVendorForm}
          heading={{
            title: "Create Vendor",
            description: "Add a new vendor to your system",
          }}
          onClose={() => createForm.reset(getDefaultVendorCreateValues())}
        >
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Building2 className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Add Vendor</span>
          </Button>
        </ControlledFormDialog>
        <ControlledFormDialog
          form={updateForm}
          onSubmit={handleUpdateVendor}
          FormComponent={CreateVendorForm}
          heading={{
            title: "Update Vendor",
            description: "Update vendor information",
          }}
        >
          <Button
            className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm"
            ref={updateEntryButtonRef}
            hidden
          ></Button>
        </ControlledFormDialog>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query}
            onChange={(e) =>
              setSearchParams({ ...searchParams, query: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={searchParams.status}
            onValueChange={(e) =>
              setSearchParams({ ...searchParams, status: e })
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-[130px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="STATUS" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_FORMATTED.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.label}
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
                Contact Person
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Address
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Status
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Last Ordered
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: searchParams.limit }).map((_, index) => (
                <TableRow key={index} className="border-input/40">
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (dataList?.list.length ?? 0) > 0 ? (
              dataList?.list?.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {vendor.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-foreground">
                    <strong className="block first-letter:uppercase">
                      {vendor.contactPerson}
                    </strong>
                    <div className="flex items-center">
                      <span>{vendor.phone}</span> <Dot />
                      <span>{vendor.email || "N/A"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {vendor.address || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    <ActiveBadge isActive={vendor.isActive} />
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {vendor.lastOrderDate
                      ? formatDate(vendor.lastOrderDate, {
                          month: "short",
                          year: "numeric",
                          day: "numeric",
                        })
                      : "Never Ordered"}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewVendor(vendor.id)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditVendorButtonClick(vendor.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <WarningDialog
                        id={vendor.id}
                        handler={handleDeleteVendor}
                        heading={{
                          title: "Delete Vendor",
                          description:
                            "Are you sure you want to delete this vendor? This action is irreversible.",
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </WarningDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
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
            value={searchParams.limit.toString()}
            onValueChange={(val) => {
              setSearchParams({ ...searchParams, limit: Number(val), page: 1 });
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
            {recordStart}-{recordEnd} of {dataList?.count ?? 0}
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
                <PaginationLink>{searchParams.page}</PaginationLink>
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
