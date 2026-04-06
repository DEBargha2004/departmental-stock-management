import CreateUserForm from "@/components/custom/forms/user-create";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TFormProps } from "@/types/form-props";
import type { TUserCreateSchema } from "@repo/contracts/user";

export default function UserFormDialog({
  form,
  onSubmit,
  children,
}: TFormProps<TUserCreateSchema> & { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>
        <CreateUserForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
