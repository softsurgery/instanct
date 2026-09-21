import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  defaultState?: boolean;
}

export const PasswordField = ({
  className,
  placeholder,
  defaultState = false,
  ...props
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(defaultState);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <div className={cn("grid gap-2 text-left")}>
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || "Enter password"}
          className={cn("pr-10", className)}
          autoComplete="new-password"
        />
        <Button
          type="button"
          onClick={togglePasswordVisibility}
          variant={"link"}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      </div>
    </div>
  );
};
