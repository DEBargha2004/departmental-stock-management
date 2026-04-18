import { API_URL } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TPurchaseOrderQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TPurchaseOrderCreateSchema,
  TPurchaseOrderUpdateSchema,
} from "@repo/contracts/purchase-order";

export type TPurchaseOrder = {
  id: number;
  vendorName: string;
  orderDate: string;
  totalAmount: number;
  status: "DRAFT" | "APPROVED" | "RECEIVED";
  itemsCount: number;
};

export async function createPurchaseOrderRequest(
  data: TPurchaseOrderCreateSchema,
): Promise<AxiosResponse<TSuccess<TPurchaseOrder>>> {
  // Mock implementation
  console.log("Mock Create PO:", data);
  return {
    data: {
      success: true,
      message: "PO Created",
      data: {
        id: Date.now(),
        vendorName: "Mock Vendor",
        orderDate: data.orderDate,
        totalAmount: 0,
        status: "DRAFT",
        itemsCount: data.items.length,
      },
    },
  } as any;
}

export async function updatePurchaseOrderRequest(params: {
  id: number;
  payload: TPurchaseOrderUpdateSchema;
}): Promise<AxiosResponse<TSuccess<TPurchaseOrder>>> {
  // Mock implementation
  return {
    data: {
      success: true,
      message: "PO Updated",
      data: {
        id: params.id,
        vendorName: "Mock Vendor",
        orderDate: new Date().toISOString(),
        totalAmount: 0,
        status: "DRAFT",
        itemsCount: 1,
      },
    },
  } as any;
}

export async function deletePurchaseOrderRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  // Mock implementation
  return { data: { success: true, message: "PO Deleted", data: null } } as any;
}

export async function getPurchaseOrderRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TPurchaseOrder>>> {
  // Mock implementation
  return {
    data: {
      success: true,
      message: "PO Fetched",
      data: {
        id: params.id,
        vendorName: "Mock Vendor",
        orderDate: new Date().toISOString(),
        totalAmount: 1000,
        status: "DRAFT",
        itemsCount: 2,
      },
    },
  } as any;
}

export async function getAllPurchaseOrdersRequest({
  query = "",
  status,
  limit,
  page,
}: TPurchaseOrderQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TPurchaseOrder[]>>>
> {
  // Mock implementation
  const mockData: TPurchaseOrder[] = [
    {
      id: 1,
      vendorName: "Global Tech",
      orderDate: "2024-03-15",
      totalAmount: 1250.5,
      status: "APPROVED",
      itemsCount: 5,
    },
    {
      id: 2,
      vendorName: "SPS Supplies",
      orderDate: "2024-03-18",
      totalAmount: 840.0,
      status: "DRAFT",
      itemsCount: 2,
    },
    {
      id: 3,
      vendorName: "InterOffice",
      orderDate: "2024-03-20",
      totalAmount: 3200.0,
      status: "RECEIVED",
      itemsCount: 12,
    },
  ];

  return {
    data: {
      success: true,
      message: "POs List Fetched",
      data: {
        list: mockData,
        count: mockData.length,
      },
    },
  } as any;
}
