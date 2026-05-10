import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TStockBatchQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TStockBatchCreateSchema,
  TStockBatchUpdateSchema,
  TStockBatch,
  TStockBatchItem,
} from "@repo/contracts/stock-batch";
import { api } from "@/lib/axios";
import type { TPurchaseOrder } from "@repo/contracts/purchase-order";
import type { TProduct } from "@repo/contracts/item";
import type { TVendor } from "@repo/contracts/vendor";



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
}): Promise<
  AxiosResponse<
    TSuccess<{
      batch: TStockBatch;
      list: {
        purchaseOrder: {
          order: TPurchaseOrder;
          list: { product: TProduct[]; vendor: TVendor[] };
        }[];
      };
    }>
  >
> {
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
