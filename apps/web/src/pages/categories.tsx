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
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  type TCategoryCreateSchema,
  type TCategoryUpdateSchema,
} from "@repo/contracts/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getDefaultCategoryCreateValues } from "@/constants/form-defaults/category";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/controllers/category/mutation";
import { useGetAllCategoriesQuery } from "@/controllers/category/query";
import { catchError } from "@/lib/catch-error";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import ControlledFormDialog from "@/components/custom/controlled-form-dialog";
import CreateCategoryForm from "@/components/custom/forms/category-create";
import WarningDialog from "@/components/custom/warning-dialog";
import { getCategoryRequest } from "@/controllers/category/api";
import { useRef } from "react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { STATUS_FORMATTED, type STATUS } from "@repo/contracts/status";
import ActiveBadge from "@/components/custom/active-badge";

const pageLimits = [10, 20, 30, 40, 50];

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    status: parseAsString.withDefault("all"),
    page: parseAsInteger.withDefault(1),
  });

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const createForm = useForm<TCategoryCreateSchema>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: getDefaultCategoryCreateValues(),
  });

  const updateForm = useForm<TCategoryUpdateSchema>({
    resolver: zodResolver(categoryUpdateSchema),
  });

  const updateEntryButtonRef = useRef<HTMLButtonElement>(null);
  const activeUpdateCategory = useRef<number | null>(null);

  const { data: categoryList, isLoading } = useGetAllCategoriesQuery({
    query: debouncedQuery,
    status:
      searchParams.status === "all" ? null : (searchParams.status as STATUS),
    limit: searchParams.limit,
    page: searchParams.page,
  });

  const { mutateAsync: createCategory } = useCreateCategoryMutation();
  const { mutateAsync: updateCategory } = useUpdateCategoryMutation();
  const { mutateAsync: deleteCategory } = useDeleteCategoryMutation();

  const dataList = categoryList?.data.data;
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

  const handleAddCategory = async (data: TCategoryCreateSchema) => {
    await catchError(createCategory(data));
    createForm.reset();
  };

  const handleEditCategory = async (categoryId: number) => {
    const [err, res] = await catchError(getCategoryRequest({ id: categoryId }));
    if (err) return toast.error(err.message);

    const btn = updateEntryButtonRef.current;
    const { data } = res.data;
    if (btn) {
      activeUpdateCategory.current = categoryId;
      btn.click();
      updateForm.reset({
        name: data?.name ?? "",
        description: data?.description ?? "",
      });
    }
  };

  const handleUpdateCategory = async (data: TCategoryUpdateSchema) => {
    if (!activeUpdateCategory.current) return;

    await updateCategory({
      id: activeUpdateCategory.current,
      payload: data,
    });

    activeUpdateCategory.current = null;
  };

  const handleDeleteCategory = async (categoryId: number) => {
    await catchError(deleteCategory({ id: categoryId }));
  };

  const handleViewCategory = (categoryId: number) => {
    console.log("View category:", categoryId);
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
        <ControlledFormDialog
          form={createForm}
          onSubmit={handleAddCategory}
          FormComponent={CreateCategoryForm}
          heading={{
            title: "Create Category",
            description:
              "Organize and classify inventory into manageable categories.",
          }}
          onClose={() => createForm.reset(getDefaultCategoryCreateValues())}
        >
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Add Category</span>
          </Button>
        </ControlledFormDialog>
        <ControlledFormDialog
          form={updateForm}
          onSubmit={handleUpdateCategory}
          FormComponent={CreateCategoryForm}
          heading={{
            title: "Update Category",
            description: "Update existing inventory category details.",
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
            placeholder="Search categories..."
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
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
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
              dataList?.list.map((category) => (
                <TableRow
                  key={category.id}
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {category.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    {category.itemsCount}
                  </TableCell>
                  <TableCell className="py-3">
                    <ActiveBadge isActive={category.isActive} />
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewCategory(category.id)}
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditCategory(category.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <WarningDialog
                        id={category.id}
                        handler={handleDeleteCategory}
                        heading={{
                          title: "Delete Category",
                          description:
                            "Are you sure you want to delete this category? This action is irreversible.",
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
