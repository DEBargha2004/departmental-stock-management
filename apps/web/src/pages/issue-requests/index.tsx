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
import { Search, Edit, Trash2, Eye, Plus, ClipboardList } from "lucide-react";
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
  issueRequestCreateSchema,
  issueRequestUpdateSchema,
  type TIssueRequestCreateSchema,
  type TIssueRequestUpdateSchema,
} from "@repo/contracts/circulation";
import { getDefaultIssueRequestCreateValues } from "@/constants/form-defaults/issue-request";
import {
  useCreateIssueRequestMutation,
  useDeleteIssueRequestMutation,
  useUpdateIssueRequestMutation,
} from "@/controllers/issue-request/mutation";
import { useGetAllIssueRequestsQuery } from "@/controllers/issue-request/query";
import CreateIssueRequestForm from "@/components/custom/forms/issue-request-create";
import { getIssueRequestRequest } from "@/controllers/issue-request/api";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TProduct } from "@repo/contracts/item";
import type { TUser } from "@repo/contracts/user";

import IssueRequestItemList from "./_components/issue-item-list";

const pageLimits = [10, 20, 30, 40, 50];

export default function IssueRequestsPage() {
  const [searchParams, setSearchParams] = useQueryStates({
    query: parseAsString.withDefault(""),
    limit: parseAsInteger.withDefault(20),
    page: parseAsInteger.withDefault(1),
  });

  const updateEntryButtonRef = useRef<HTMLButtonElement>(null);
  const activeUpdateId = useRef<number | null>(null);
  const [activeIssueRequestItems, setActiveIssueRequestItems] = useState<{
    products: TProduct[];
    user: TUser | null;
  }>({ products: [], user: null });

  const debouncedQuery = useDebounce(searchParams.query, 500);

  const createForm = useForm<TIssueRequestCreateSchema>({
    resolver: zodResolver(issueRequestCreateSchema),
    defaultValues: getDefaultIssueRequestCreateValues(),
  });
  const updateForm = useForm<TIssueRequestUpdateSchema>({
    resolver: zodResolver(issueRequestUpdateSchema),
  });

  const { data: requestsList, isLoading } = useGetAllIssueRequestsQuery({
    query: debouncedQuery,
    limit: searchParams.limit,
    page: searchParams.page,
  });

  const { mutateAsync: createRequest } = useCreateIssueRequestMutation();
  const { mutateAsync: updateRequest } = useUpdateIssueRequestMutation();
  const { mutateAsync: deleteRequest } = useDeleteIssueRequestMutation();

  const dataList = requestsList?.data.data;
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

  const handleCreate = async (data: TIssueRequestCreateSchema) => {
    const [err, res] = await catchError(createRequest(data));
    if (err) return toast.error(err.message);
    toast.success(res.data.message);
    createForm.reset(getDefaultIssueRequestCreateValues());
  };

  const handleEditButtonClick = async (id: number) => {
    const [err, res] = await catchError(getIssueRequestRequest({ id }));
    if (err) return toast.error(err.message);

    const btn = updateEntryButtonRef.current;
    const { data } = res.data;
    if (btn && data) {
      activeUpdateId.current = id;
      setActiveIssueRequestItems({
        products: data.list.products,
        user: data.list.user,
      });

      btn.click();
      updateForm.reset({
        issueDate: data.request.issueDate,
        userId: data.request.issuedTo.id,
        items: data.request.items.map((item) => ({
          itemId: item.product.id,
          quantity: item.quantity,
        })),
      });
    }
  };

  const handleUpdate = async (data: TIssueRequestUpdateSchema) => {
    if (!activeUpdateId.current) return;
    const [err, res] = await catchError(
      updateRequest({
        id: activeUpdateId.current,
        payload: data,
      }),
    );
    if (err) return toast.error(err.message);
    toast.success(res.data.message);
    activeUpdateId.current = null;
  };

  const handleDelete = async (id: number) => {
    await deleteRequest({ id });
  };

  return (
    <div className="w-full flex flex-col space-y-6 py-6 px-4 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Issue Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track stock issue requests from different departments.
          </p>
        </div>
        <ControlledFormDialog
          form={createForm}
          onSubmit={handleCreate}
          FormComponent={CreateIssueRequestForm}
          heading={{
            title: "Create Issue Request",
            description: "Request stock items for a department or user",
          }}
          onClose={() => createForm.reset(getDefaultIssueRequestCreateValues())}
        >
          <Button className="flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">New Request</span>
          </Button>
        </ControlledFormDialog>
        <ControlledFormDialog
          form={updateForm}
          onSubmit={handleUpdate}
          FormComponent={({ form, onSubmit }) => (
            <CreateIssueRequestForm
              form={form}
              onSubmit={onSubmit}
              defaultList={{
                products: activeIssueRequestItems.products,
                users: activeIssueRequestItems.user
                  ? [activeIssueRequestItems.user]
                  : [],
              }}
            />
          )}
          heading={{
            title: "Update Issue Request",
            description: "Modify existing issue request details",
          }}
        >
          <Button className="hidden" ref={updateEntryButtonRef}></Button>
        </ControlledFormDialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-9 h-9 w-full bg-transparent border-input/60 hover:border-input focus:border-ring transition-colors rounded-lg shadow-sm"
            value={searchParams.query || ""}
            onChange={(e) =>
              setSearchParams({ ...searchParams, query: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto"></div>
      </div>

      <div className="border border-input/40 rounded-xl bg-card overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Request ID
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Issued To
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Issued By
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-11">
                Date
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground text-center h-11">
                Items
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
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-12" />
                    </div>
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
              dataList?.list?.map((req) => (
                <TableRow
                  className="group hover:bg-muted/40 transition-colors border-input/40"
                  key={req.id}
                >
                  <TableCell className="font-medium py-3 text-sm">
                    {req.issueCode}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">
                    {req.issuedTo.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium text-muted-foreground">
                    {req.issuedBy.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {formatDate(req.issueDate)}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-center font-medium">
                    {req.items.length}
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
                          <DialogTitle className="flex items-center gap-2">
                            <span>Issue Request Details</span>
                            <span className="text-sm font-normal text-muted-foreground">
                              ({req.issueCode})
                            </span>
                          </DialogTitle>
                          <IssueRequestItemList request={req} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditButtonClick(req.id)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <WarningDialog
                        id={req.id}
                        handler={handleDelete}
                        heading={{
                          title: "Delete Issue Request",
                          description:
                            "Are you sure you want to delete this issue request? This action cannot be undone.",
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
                      <ClipboardList className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium text-foreground">
                      No issue requests found
                    </p>
                    <p>Try adjusting your search or filters</p>
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
            onValueChange={(val) =>
              setSearchParams({ ...searchParams, limit: Number(val), page: 1 })
            }
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
