import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { EyeClosed, EyeIcon } from "lucide-react";

export default function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className="pr-10"
      />
      <Button
        size={"icon"}
        variant={"ghost"}
        onClick={handleTogglePassword}
        type="button"
        className="absolute top-1/2 right-2 -translate-y-1/2"
      >
        {showPassword ? <EyeIcon /> : <EyeClosed />}
      </Button>
    </div>
  );
}
