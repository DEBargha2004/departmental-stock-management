import type { AUDIT_ACTION, ENTITY_TYPE } from "./status.js";

export type TAuditLog = {
  id: number;
  action: AUDIT_ACTION;
  entityType: ENTITY_TYPE;
  description: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
};
