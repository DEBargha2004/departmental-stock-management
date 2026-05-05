import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TStockBatchQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TStockBatchCreateSchema,
  TStockBatchUpdateSchema,
} from "@repo/contracts/stock-batch";
import { api } from "@/lib/axios";

export type TStockBatch = {
  id: number;
  batchNumber: string;
  purchaseOrder: {
    id: number;
    invoiceId: string;
    totalAmount: number;
    status: string;
    orderDate: Date;
  };
  vendor: {
    id: number;
    name: string;
  };
  arrivalDate: string;
  items: TStockBatchItem[];
};

export type TStockBatchItem = {
  id: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  unitPrice: number;
};

export async function createStockBatchRequest(
  data: TStockBatchCreateSchema,
): Promise<AxiosResponse<TSuccess<null>>> {
  return api.post("/inventory/stock-batch", data);
}

export async function updateStockBatchRequest({
  id,
  payload,
}: {
  id: number;
  payload: TStockBatchUpdateSchema;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.patch(`/inventory/stock-batch/${id}`, payload);
}

export async function deleteStockBatchRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/stock-batch/${id}`);
}

export async function getStockBatchRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TStockBatch>>> {
  return api.get(`/inventory/stock-batch/${id}`);
}

export async function getAllStockBatchesRequest({
  query = "",
  limit,
  page,
  vendorId,
}: TStockBatchQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TStockBatch[]>>>
> {
  return api.get("/inventory/stock-batch", {
    params: {
      query,
      limit,
      page,
      vendorId,
    },
  });
}
