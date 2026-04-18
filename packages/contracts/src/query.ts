import type { Role } from "./auth/roles.js";
import type { PRODUCT_STATUS, STATUS } from "./status.js";

export type TQuery = {
  query?: string;
  limit: number;
  page: number;
};

export type TUserQuery = TQuery & {
  role?: Role | null;
  status?: STATUS | null;
};

export type TCategoryQuery = TQuery & {
  status?: STATUS | null;
};

export type TVendorQuery = TQuery & {
  status?: STATUS | null;
};

export type TProductQuery = TQuery & {
  status?: PRODUCT_STATUS | null;
  category?: number | null;
};

export type TPurchaseOrderQuery = TQuery & {
  status?: string | null;
  vendorId?: number | null;
};
