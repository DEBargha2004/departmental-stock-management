export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const STATUS_LIST = Object.values(STATUS);

export const STATUS_FORMATTED = [
  {
    id: "active",
    label: "Active",
  },
  {
    id: "inactive",
    label: "Inactive",
  },
] as const satisfies { id: Status; label: string }[];

export const getStatusObject = (status: Status) => {
  return STATUS_FORMATTED.find((s) => s.id === status)!;
};

export type Status = (typeof STATUS)[keyof typeof STATUS];
export type MOVEMENT_TYPE = "ISSUE" | "RETURN" | "DAMAGE" | "ADJUSTMENT";
export type PO_STATUS = "DRAFT" | "APPROVED" | "RECEIVED";
