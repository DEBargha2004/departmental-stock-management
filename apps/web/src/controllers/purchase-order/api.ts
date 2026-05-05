import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TPurchaseOrderQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TPurchaseOrderCreateSchema,
  TPurchaseOrderUpdateSchema,
} from "@repo/contracts/purchase-order";
import { api } from "@/lib/axios";
import { PURCHASE_ORDER_STATUS } from "@repo/contracts/status";
import type { TProduct } from "../product/api";
import type { TVendor } from "../vendor/api";

export type TPurchaseOrder = {
  id: number;
  invoiceId: string;
  orderDate: Date;
  status: PURCHASE_ORDER_STATUS;
  totalAmount: number;
  vendor: {
    id: number;
    name: string;
  };
  items: TPurchaseOrderItem[];
};

export type TPurchaseOrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  product: {
    id: number;
    name: string;
  };
};

export async function createPurchaseOrderRequest(
  data: TPurchaseOrderCreateSchema,
): Promise<AxiosResponse<TSuccess<null>>> {
  return api.post("/inventory/purchase-order/create", data);
}

export async function updatePurchaseOrderRequest({
  id,
  payload,
}: {
  id: number;
  payload: TPurchaseOrderUpdateSchema;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.patch(`/inventory/purchase-order/${id}`, payload);
}

export async function deletePurchaseOrderRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/purchase-order/${id}`);
}

export async function getPurchaseOrderRequest({ id }: { id: number }): Promise<
  AxiosResponse<
    TSuccess<{
      order: TPurchaseOrder;
      list: { product: TProduct[]; vendor: TVendor[] };
    }>
  >
> {
  return api.get(`/inventory/purchase-order/${id}`);
}

export async function getAllPurchaseOrdersRequest({
  query = "",
  status,
  limit,
  page,
  vendorId,
}: TPurchaseOrderQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TPurchaseOrder[]>>>
> {
  return api.get("/inventory/purchase-order/list", {
    params: {
      query,
      status,
      limit,
      page,
      vendorId,
    },
  });
}
