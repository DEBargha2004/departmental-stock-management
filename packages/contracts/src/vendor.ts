import z from "zod";

export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.email("Invalid email address").optional(),
  address: z.string().optional(),
});

export const vendorUpdateSchema = z.object({
  id: z.coerce.number<number>(),
  data: vendorSchema,
});

export type TVendor = z.infer<typeof vendorSchema>;
export type TVendorUpdate = z.infer<typeof vendorUpdateSchema>;
