import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { catchError } from "@/lib/catch-error";
import { toast } from "sonner";

export default function WarningDialog({
  children,
  heading: { title, description },
  id,
  handler,
}: {
  children: React.ReactNode;
  heading: { title: string; description: string };
  id: number;
  handler: (id: number) => Promise<void>;
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleProceed = async () => {
    setIsExecuting(true);
    const [err] = await catchError(handler(id));

    if (err) toast.error(err.message);

    setIsExecuting(false);
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={handleProceed}
            disabled={isExecuting}
          >
            {isExecuting && <Loader2 size={16} className="animate-spin mr-2" />}
            <span>Proceed</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
