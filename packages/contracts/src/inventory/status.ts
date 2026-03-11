export const status = ["DRAFT", "ACTIVE", "INACTIVE"] as const;

export type STATUS = (typeof status)[number];
export type MOVEMENT_TYPE = "ISSUE" | "RETURN" | "DAMAGE" | "ADJUSTMENT";
export type PO_STATUS = "DRAFT" | "APPROVED" | "RECEIVED";
