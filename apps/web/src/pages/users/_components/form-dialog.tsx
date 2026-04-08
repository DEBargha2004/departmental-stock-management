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
import { useEffect, useState } from "react";

export default function UserFormDialog({
  form,
  onSubmit,
  children,
}: TFormProps<TUserCreateSchema> & { children: React.ReactNode }) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;

  useEffect(() => {
    setDialogOpen(false);
  }, [isSubmitSuccessful]);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
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
