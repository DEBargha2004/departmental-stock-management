import type { Role } from "./auth/roles.js";
import type { Status } from "./status.js";

export type TQuery = {
  query?: string;
  limit: number;
  page: number;
};

export type TUserQuery = TQuery & {
  role?: Role | null;
  status?: Status | null;
};

export type TCategoryQuery = TQuery & {
  status?: Status | null;
};

export type TVendorQuery = TQuery & {
  status?: Status | null;
};
