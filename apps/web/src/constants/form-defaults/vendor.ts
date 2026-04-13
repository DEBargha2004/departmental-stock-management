import type { TVendorCreateSchema } from "@repo/contracts/vendor";

export const getDefaultVendorCreateValues = (): TVendorCreateSchema => ({
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
});
