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
  onClose,
}: TFormProps<T> & {
  children: React.ReactNode;
  FormComponent: (formProps: TFormProps<T>) => React.ReactNode;
  heading: {
    title: string;
    description: string;
  };
  onClose?: () => void;
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const isSubmitSuccessful = form.formState.isSubmitSuccessful;
  const isSubmitted = form.formState.isSubmitted;

  useEffect(() => {
    if (isSubmitSuccessful && isSubmitted) {
      setDialogOpen(false);
      onClose?.();
    }
  }, [isSubmitSuccessful, isSubmitted]);

  useEffect(() => {
    if (!isDialogOpen) onClose?.();
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-40px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{heading.title}</DialogTitle>
          <DialogDescription>{heading.description}</DialogDescription>
        </DialogHeader>
        <FormComponent form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
