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
import { Search, Edit, Trash2, Eye, Plus } from "lucide-react";
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
import {
  PRODUCT_STATUS_FORMATTED,
  type PRODUCT_STATUS,
} from "@repo/contracts/status";
import {
  productCreateSchema,
  productUpdateSchema,
  type TProductCreateSchema,
  type TProductUpdateSchema,
} from "@repo/contracts/item";
import { getDefaultProductCreateValues } from "@/constants/form-defaults/product";
import {
  useCreateItemMutation,
  useDeleteItemMutation,
  useUpdateItemMutation,
} from "@/controllers/product/mutation";
import { useGetAllItemsQuery } from "@/controllers/product/query";
import { getItemRequest } from "@/controllers/product/api";
import { useGetAllCategoriesQuery } from "@/controllers/category/query";
import CreateProductForm from "@/components/custom/forms/product-create-form";
import UpdateProductForm from "@/components/custom/forms/product-update-form";

const pageLimits = [10, 20, 30, 40, 50];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    status: parseAsString.withDefault("all"),
    category: parseAsInteger,
    page: parseAsInteger.withDefault(1),
  });

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const createForm = useForm<TProductCreateSchema>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: getDefaultProductCreateValues(),
  });

  const updateForm = useForm<TProductUpdateSchema>({
    resolver: zodResolver(productUpdateSchema),
  });

  const updateEntryButtonRef = useRef<HTMLButtonElement>(null);
  const activeUpdateProduct = useRef<number | null>(null);

  const { data: itemList, isLoading } = useGetAllItemsQuery({
    query: debouncedQuery,
    status:
      searchParams.status === "all"
        ? null
        : (searchParams.status as PRODUCT_STATUS),
    limit: searchParams.limit,
    page: searchParams.page,
    category: searchParams.category,
  });

  const { data: categoryList } = useGetAllCategoriesQuery({
    limit: 100,
    page: 1,
  });

  const { mutateAsync: createItem } = useCreateItemMutation();
  const { mutateAsync: updateItem } = useUpdateItemMutation();
  const { mutateAsync: deleteItem } = useDeleteItemMutation();

  const dataList = itemList?.data.data;
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

  const handleAddProduct = async (data: TProductCreateSchema) => {
    await catchError(createItem(data));
    createForm.reset();
  };

  const handleEditProduct = async (productId: number) => {
    const [err, res] = await catchError(getItemRequest({ id: productId }));
    if (err) return toast.error(err.message);

    const btn = updateEntryButtonRef.current;
    const { data } = res.data;
    if (btn) {
      activeUpdateProduct.current = productId;
      btn.click();
      updateForm.reset({
        name: data?.name ?? "",
        imageUrl: data?.imageUrl ?? "",
        categoryId: data?.category?.id,
        price: data?.price ?? 0,
        minStockLevel: data?.stock?.minStockLevel ?? 0,
      });
    }
  };

  const handleUpdateProduct = async (data: TProductUpdateSchema) => {
    if (!activeUpdateProduct.current) return;

    await updateItem({
      id: activeUpdateProduct.current,
      payload: data,
    });

    activeUpdateProduct.current = null;
  };

  const handleDeleteProduct = async (productId: number) => {
    await catchError(deleteItem({ id: productId }));
  };

  const handleViewProduct = (productId: number) => {
    console.log("View product:", productId);
  };

  // Helper for status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-emerald-500";
      case "low_stock":
        return "bg-amber-500";
      case "out_of_stock":
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
        <ControlledFormDialog
          form={createForm}
          onSubmit={handleAddProduct}
          FormComponent={CreateProductForm}
          heading={{
            title: "Create Product",
            description: "Add a new product to the inventory.",
          }}
          onClose={() => createForm.reset(getDefaultProductCreateValues())}
        >
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Add Product</span>
          </Button>
        </ControlledFormDialog>
        <ControlledFormDialog
          form={updateForm}
          onSubmit={handleUpdateProduct}
          FormComponent={UpdateProductForm}
          heading={{
            title: "Update Product",
            description: "Update existing product details.",
          }}
        >
          <Button className="hidden" ref={updateEntryButtonRef} />
        </ControlledFormDialog>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search products..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query}
            onChange={(e) =>
              setSearchParams({ ...searchParams, query: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={searchParams.category?.toString() ?? "all"}
            onValueChange={(val) =>
              setSearchParams({
                ...searchParams,
                category: val === "all" ? null : Number(val),
              })
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-[160px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Categories</SelectItem>
              {categoryList?.data?.data?.list.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.status}
            onValueChange={(val) =>
              setSearchParams({ ...searchParams, status: val })
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-[140px] bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Status</SelectItem>
              {PRODUCT_STATUS_FORMATTED.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.label}
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
            {isLoading ? (
              Array.from({ length: searchParams.limit }).map((_, index) => (
                <TableRow key={index} className="border-input/40">
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-16" />
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
              dataList?.list.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {item.category?.name ?? "-"}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">
                    {item.stock.quantity ?? 0}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3">
                    {/* Status logic can be improved based on quantity vs minStockLevel if needed, 
                        but here we use the backend logic if provided. 
                        Actually the backend doesn't return a explicit string status in list view, 
                        so we can derive it here. */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          (item.stock.quantity ?? 0) === 0
                            ? getStatusColor("out_of_stock")
                            : (item.stock.quantity ?? 0) <=
                                (item.stock.minStockLevel ?? 0)
                              ? getStatusColor("low_stock")
                              : getStatusColor("in_stock")
                        }`}
                      />
                      <span className="text-sm text-muted-foreground capitalize">
                        {(item.stock.quantity ?? 0) === 0
                          ? "Out of Stock"
                          : (item.stock.quantity ?? 0) <=
                              (item.stock.minStockLevel ?? 0)
                            ? "Low Stock"
                            : "In Stock"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewProduct(item.id)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditProduct(item.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <WarningDialog
                        id={item.id}
                        handler={handleDeleteProduct}
                        heading={{
                          title: "Delete Product",
                          description:
                            "Are you sure you want to delete this product? This action is irreversible.",
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
                      <Search className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium text-foreground">
                      No products found
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
          <span className="font-medium text-foreground">
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
