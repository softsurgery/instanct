import React from "react";
import { toast } from "sonner";
import { Button, Label, cn } from "@instanct/ui";
import { PasswordField } from "@instanct/form-builder";
import { AuthFormHeader } from "./AuthFormHeader";

export interface ResetPasswordFormLabels {
  title: string;
  description: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  passwordRequired: string;
  passwordsDoNotMatch: string;
  passwordMinLength: string;
  cancel: string;
  reset: string;
}

export interface ResetPasswordFormProps {
  className?: string;
  token: string;
  labels: ResetPasswordFormLabels;
  onCancel: () => void;
  onSubmit: (
    token: string,
    password: string,
  ) => Promise<{ message?: string; success?: boolean }>;
}

export function ResetPasswordForm({
  className,
  token,
  labels,
  onCancel,
  onSubmit,
}: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      toast.error(labels.passwordRequired);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(labels.passwordsDoNotMatch);
      return;
    }
    if (password.length < 6) {
      toast.error(labels.passwordMinLength);
      return;
    }

    setIsPending(true);
    try {
      const result = await onSubmit(token, password);
      toast.success(result.message || labels.reset);
      onCancel();
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <AuthFormHeader title={labels.title} description={labels.description} />

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">{labels.password}</Label>
          <PasswordField
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            autoComplete="new-password"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">{labels.confirmPassword}</Label>
          <PasswordField
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            autoComplete="new-password"
          />
        </div>
        {password !== confirmPassword && (
          <span className="text-xs font-medium leading-3 text-destructive">
            {labels.passwordMismatch}
          </span>
        )}

        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isPending}
          >
            {labels.cancel}
          </Button>
          <Button type="submit" className="w-full" disabled={isPending}>
            {labels.reset}
          </Button>
        </div>
      </form>
    </div>
  );
}
