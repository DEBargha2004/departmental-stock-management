import type { TFormProps } from "@/types/form-props";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState } from "react";

export default function ControlledFormDialog<
  T extends Record<string, unknown>,
>({
  form,
  onSubmit,
  FormComponent,
  children,
  heading,
}: TFormProps<T> & {
  children: React.ReactNode;
  FormComponent: (formProps: TFormProps<T>) => React.ReactNode;
  heading: {
    title: string;
    description: string;
  };
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;

  useEffect(() => {
    setDialogOpen(false);
    form.reset();
  }, [isSubmitSuccessful]);

  useEffect(() => {
    if (isDialogOpen) form.reset();
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading.title}</DialogTitle>
          <DialogDescription>{heading.description}</DialogDescription>
        </DialogHeader>
        <FormComponent form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
