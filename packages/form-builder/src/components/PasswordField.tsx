import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@qlp/ui";

interface PasswordFieldProps extends React.ComponentProps<"input"> {
  className?: string;
}

export const PasswordField = ({
  className,
  placeholder,
  ...props
}: PasswordFieldProps) => {
  const { t } = useTranslation("form-builder");
  const [showPassword, setShowPassword] = React.useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <div className="grid gap-2 text-start">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || t("password.placeholder")}
          className="pe-10"
          autoComplete="new-password"
          {...props}
        />
        <Button
          type="button"
          onClick={togglePasswordVisibility}
          variant={"link"}
          className="absolute inset-y-0 end-0 flex items-center pe-3"
          aria-label={showPassword ? t("password.hide") : t("password.show")}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      </div>
    </div>
  );
};
