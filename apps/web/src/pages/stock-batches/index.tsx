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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Trash2, Eye, Plus, Package } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockBatchCreateSchema,
  stockBatchUpdateSchema,
  type TStockBatchCreateSchema,
  type TStockBatchUpdateSchema,
} from "@repo/contracts/stock-batch";
import StockBatchCreateForm from "@/components/custom/forms/stock-batch-create";
import { getDefaultStockBatchCreateValues } from "@/constants/form-defaults/stock-batch";
import { useGetAllVendorsQuery } from "@/controllers/vendor/query";
import { useGetAllStockBatchesQuery } from "@/controllers/stock-batch/query";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import WarningDialog from "@/components/custom/warning-dialog";
import { catchError } from "@/lib/catch-error";
import {
  useCreateStockBatchMutation,
  useDeleteStockBatchMutation,
  useUpdateStockBatchMutation,
} from "@/controllers/stock-batch/mutation";
import { getStockBatchRequest, type TStockBatch } from "@/controllers/stock-batch/api";
import type { TPurchaseOrder } from "@/controllers/purchase-order/api";
import { useRef, useState } from "react";
import StockBatchItemList from "./_components/stock-batch-item-list";

const pageLimits = [10, 20, 30, 40, 50];

// Mock Data

export default function StockBatchesPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    page: parseAsInteger.withDefault(1),
    vendorId: parseAsInteger.withDefault(-1),
  });

  const createForm = useForm<TStockBatchCreateSchema>({
    resolver: zodResolver(stockBatchCreateSchema),
    defaultValues: getDefaultStockBatchCreateValues(),
  });
  const updateForm = useForm<TStockBatchUpdateSchema>({
    resolver: zodResolver(stockBatchUpdateSchema),
  });

  const updateEntryButtonRef = useRef<HTMLButtonElement>(null);
  const activeUpdateBatch = useRef<number | null>(null);
  const [activeBatchPurchaseOrders, setActiveBatchPurchaseOrders] = useState<
    TPurchaseOrder[]
  >([]);
  const { data: vendors, isLoading: isVendorLoading } = useGetAllVendorsQuery({
    query: "",
    limit: 500,
    page: 1,
  });

  const vendorsList = vendors?.data?.data?.list;

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const { mutateAsync: createBatch } = useCreateStockBatchMutation();
  const { mutateAsync: updateBatch } = useUpdateStockBatchMutation();
  const { mutateAsync: deleteBatch } = useDeleteStockBatchMutation();

  const handleReceiveBatch = async (data: TStockBatchCreateSchema) => {
    const [err, res] = await catchError(createBatch(data));

    if (err) return toast.error(err.message);

    toast.success(res.data.message);
    createForm.reset(getDefaultStockBatchCreateValues());
  };

  const handleEditBatchButtonClick = async (id: number) => {
    const [err, res] = await catchError(getStockBatchRequest({ id }));
    if (err) return toast.error(err.message);

    const btn = updateEntryButtonRef.current;
    const { data } = res.data;
    if (btn && data) {
      activeUpdateBatch.current = id;
      setActiveBatchPurchaseOrders(data.list.purchaseOrder.map((po) => po.order));
      btn.click();
      updateForm.reset({
        batchNumber: data.batch.batchNumber,
        purchaseOrderId: data.batch.purchaseOrder.id,
        arrivalDate: new Date(data.batch.arrivalDate),
        purchaseItems: data.batch.items.map((item) => ({
          purchaseItemId: item.purchaseOrderItemId,
          quantityReceived: item.quantity,
        })),
      });
    }
  };

  const handleUpdateBatch = async (data: TStockBatchUpdateSchema) => {
    if (!activeUpdateBatch.current) return;

    const [err, res] = await catchError(
      updateBatch({
        id: activeUpdateBatch.current,
        payload: data,
      }),
    );

    if (err) return toast.error(err.message);

    toast.success(res.data.message);
    activeUpdateBatch.current = null;
  };

  const handleDeleteBatch = async (id: number) => {
    await catchError(deleteBatch({ id }));
  };

  const { data: sbList, isLoading } = useGetAllStockBatchesQuery({
    query: debouncedQuery,
    limit: searchParams.limit,
    page: searchParams.page,
    vendorId: searchParams.vendorId !== -1 ? searchParams.vendorId : undefined,
  });
  const dataList = sbList?.data.data;
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

  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Stock Batches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage incoming inventory batches from purchase orders.
          </p>
        </div>
        <ControlledFormDialog
          form={createForm}
          onSubmit={handleReceiveBatch}
          FormComponent={StockBatchCreateForm}
          heading={{
            title: "Receive New Batch",
            description: "Log a new arrival of goods from a purchase order",
          }}
          onClose={() => createForm.reset(getDefaultStockBatchCreateValues())}
        >
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Receive Batch</span>
          </Button>
        </ControlledFormDialog>
        <ControlledFormDialog
          form={updateForm}
          onSubmit={handleUpdateBatch}
          FormComponent={({ form, onSubmit }) => (
            <StockBatchCreateForm
              form={form}
              onSubmit={onSubmit}
              defaultList={{
                purchaseOrders: activeBatchPurchaseOrders,
              }}
            />
          )}
          heading={{
            title: "Update Stock Batch",
            description: "Modify existing stock batch details",
          }}
        >
          <Button className="hidden" ref={updateEntryButtonRef}></Button>
        </ControlledFormDialog>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches or POs..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query || ""}
            onChange={(e) =>
              setSearchParams({ ...searchParams, query: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={searchParams.vendorId.toString()}
            onValueChange={(e) =>
              setSearchParams({ ...searchParams, vendorId: Number(e) })
            }
            disabled={isVendorLoading}
          >
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="-1">All Vendors</SelectItem>
              {vendorsList?.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stock Batches Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Batch Number
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                PO Reference
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Vendor
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Arrival Date
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-right h-11">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="border-input/40">
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (dataList?.count ?? 0) > 0 ? (
              dataList?.list.map((sb) => (
                <TableRow
                  key={sb.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {sb.batchNumber}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">
                    {sb.purchaseOrder.invoiceId}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    {sb.vendor.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {formatDate(sb.arrivalDate, {
                      dateStyle: "medium",
                    })}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                              <Package className="h-5 w-5 text-primary" />
                              Batch Details: {sb.batchNumber}
                            </DialogTitle>
                          </DialogHeader>
                          <StockBatchItemList batch={sb} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditBatchButtonClick(sb.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <WarningDialog
                        id={sb.id}
                        handler={handleDeleteBatch}
                        heading={{
                          title: "Delete Stock Batch",
                          description:
                            "Are you sure you want to delete this stock batch? This action is irreversible.",
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
                  className="h-64 text-center text-sm text-muted-foreground border-input/40"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Package className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium text-foreground">
                      No stock batches found
                    </p>
                    <p>Try adjusting your search or filters</p>
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
