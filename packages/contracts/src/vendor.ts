import z from "zod";

export const vendorCreateSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
});

export const vendorUpdateSchema = vendorCreateSchema;

export type TVendorCreateSchema = z.infer<typeof vendorCreateSchema>;
export type TVendorUpdateSchema = z.infer<typeof vendorUpdateSchema>;

export type TVendor = {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  lastOrderDate?: Date | string | null;
};
