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
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Plus,
  FileBox,
} from "lucide-react";
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
import { useRef, useState } from "react";
import WarningDialog from "@/components/custom/warning-dialog";
import {
  purchaseOrderCreateSchema,
  purchaseOrderUpdateSchema,
  type TPurchaseOrderCreateSchema,
  type TPurchaseOrderUpdateSchema,
} from "@repo/contracts/purchase-order";
import { getDefaultPurchaseOrderCreateValues } from "@/constants/form-defaults/purchase-order";
import {
  useCreatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
} from "@/controllers/purchase-order/mutation";
import { useGetAllPurchaseOrdersQuery } from "@/controllers/purchase-order/query";
import CreatePurchaseOrderForm from "@/components/custom/forms/purchase-order-create";
import { getPurchaseOrderRequest } from "@/controllers/purchase-order/api";
import { formatDate } from "@/lib/utils";
import {
  PURCHASE_ORDER_STATUS_FORMATTED,
  type PURCHASE_ORDER_STATUS,
} from "@repo/contracts/status";
import { useGetAllVendorsQuery } from "@/controllers/vendor/query";
import { POStatusBadge } from "./_components/po-status";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PurchaseOrderItemList from "./_components/purchase-order-item-list";
import type { TProduct } from "@/controllers/product/api";

const pageLimits = [10, 20, 30, 40, 50];

export default function PurchaseOrdersPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    page: parseAsInteger.withDefault(1),
    status: parseAsString.withDefault("all"),
    vendorId: parseAsInteger.withDefault(-1),
  });
  const updateEntryButtonRef = useRef<HTMLButtonElement>(null);
  const activeUpdatePO = useRef<number | null>(null);
  const [activePurchaseOrderItems, setActivePurchaseOrderItems] = useState<
    TProduct[]
  >([]);

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const createForm = useForm<TPurchaseOrderCreateSchema>({
    resolver: zodResolver(purchaseOrderCreateSchema),
    defaultValues: getDefaultPurchaseOrderCreateValues(),
  });
  const updateForm = useForm<TPurchaseOrderUpdateSchema>({
    resolver: zodResolver(purchaseOrderUpdateSchema),
  });

  const { data: poList, isLoading } = useGetAllPurchaseOrdersQuery({
    query: debouncedQuery,
    limit: searchParams.limit,
    page: searchParams.page,
    status: (searchParams.status === "all"
      ? null
      : searchParams.status) as PURCHASE_ORDER_STATUS,
    vendorId: searchParams.vendorId === -1 ? null : searchParams.vendorId,
  });

  const { data: vendors } = useGetAllVendorsQuery({
    query: "",
    limit: 1000,
    page: 1,
  });

  const { mutateAsync: createPO } = useCreatePurchaseOrderMutation();
  const { mutateAsync: updatePO } = useUpdatePurchaseOrderMutation();
  const { mutateAsync: deletePO } = useDeletePurchaseOrderMutation();

  const dataList = poList?.data.data;
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

  const handleAddPO = async (data: TPurchaseOrderCreateSchema) => {
    const [err, res] = await catchError(createPO(data));

    if (err) return toast.error(err.message);

    toast.success(res.data.message);
    createForm.reset();
  };

  const handleEditPOButtonClick = async (poId: number) => {
    const [err, res] = await catchError(getPurchaseOrderRequest({ id: poId }));
    if (err) return toast.error(err.message);

    const btn = updateEntryButtonRef.current;
    const { data } = res.data;
    if (btn && data) {
      activeUpdatePO.current = poId;
      setActivePurchaseOrderItems(data.list);
      btn.click();
      updateForm.reset({
        vendorId: data.order.vendor.id,
        orderDate: data.order.orderDate,
        invoiceId: data.order.invoiceId,
        totalAmount: data.order.totalAmount,
        items: data.order.items.map((item) => ({
          itemId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    }
  };

  const handleUpdatePO = async (data: TPurchaseOrderUpdateSchema) => {
    if (!activeUpdatePO.current) return;

    await updatePO({
      id: activeUpdatePO.current,
      payload: data,
    });

    activeUpdatePO.current = null;
  };

  const handleDeletePO = async (poId: number) => {
    await deletePO({ id: poId });
  };

  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Purchase Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage procurement orders, track deliveries, and monitor supplier
            fulfillment.
          </p>
        </div>
        <ControlledFormDialog
          form={createForm}
          onSubmit={handleAddPO}
          FormComponent={CreatePurchaseOrderForm}
          heading={{
            title: "Create Purchase Order",
            description: "Issue a new purchase order to a vendor",
          }}
          onClose={() =>
            createForm.reset(getDefaultPurchaseOrderCreateValues())
          }
        >
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">New Order</span>
          </Button>
        </ControlledFormDialog>
        <ControlledFormDialog
          form={updateForm}
          onSubmit={handleUpdatePO}
          FormComponent={({ form, onSubmit }) => (
            <CreatePurchaseOrderForm
              form={form}
              onSubmit={onSubmit}
              defaultList={{
                products: activePurchaseOrderItems,
              }}
            />
          )}
          heading={{
            title: "Update Purchase Order",
            description: "Modify existing purchase order details",
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
            placeholder="Search orders..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query || ""}
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
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="STATUS" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Statuses</SelectItem>
              {PURCHASE_ORDER_STATUS_FORMATTED.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchParams.vendorId.toString()}
            onValueChange={(e) =>
              setSearchParams({ ...searchParams, vendorId: Number(e) })
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="VENDOR" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="-1">All Vendors</SelectItem>
              {vendors?.data.data?.list.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Invoice ID
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Vendor
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Order Date
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Amount
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
            {isLoading ? (
              Array.from({ length: searchParams.limit }).map((_, index) => (
                <TableRow key={index} className="border-input/40">
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-20" />
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
              dataList?.list?.map((po) => (
                <TableRow
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                  key={po.id}
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {po.invoiceId}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">
                    {po.vendor.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {formatDate(po.orderDate, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-semibold">
                    ₹
                    {po.totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    <POStatusBadge status={po.status} />
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
                        <DialogContent>
                          <DialogTitle />
                          <PurchaseOrderItemList po={po} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditPOButtonClick(po.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <WarningDialog
                        id={po.id}
                        handler={handleDeletePO}
                        heading={{
                          title: "Delete Purchase Order",
                          description:
                            "Are you sure you want to delete this purchase order? This action cannot be undone.",
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
                  colSpan={6}
                  className="h-64 text-center text-sm text-muted-foreground border-input/40"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                      <FileBox className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium text-foreground">
                      No purchase orders found
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
