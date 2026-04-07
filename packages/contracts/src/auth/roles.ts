export const ROLES = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST = Object.values(ROLES);

export const ROLES_FORMATTED = [
  {
    id: "admin",
    label: "Admin",
  },
  {
    id: "faculty",
    label: "Faculty",
  },
  {
    id: "student",
    label: "Student",
  },
] as const satisfies { id: Role; label: string }[];

export const getRoleObject = (role: Role) => {
  return ROLES_FORMATTED.find((r) => r.id === role)!;
};
