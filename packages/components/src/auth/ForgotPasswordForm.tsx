import { toast } from "sonner";
import { Button, Input, Label, cn } from "@instanct/ui";
import { AuthFormHeader } from "./AuthFormHeader";
import React from "react";

export interface ForgotPasswordFormLabels {
  title: string;
  description: string;
  emailOrUsername: string;
  cancel: string;
  sendResetLink: string;
  sending: string;
  identifierRequired: string;
  resetEmailSent: (email: string) => string;
}

export interface ForgotPasswordFormProps {
  className?: string;
  labels: ForgotPasswordFormLabels;
  onCancel: () => void;
  onSubmit: (usernameOrEmail: string) => Promise<{
    email?: string;
    success?: boolean;
    message?: string;
  }>;
}

export function ForgotPasswordForm({
  className,
  labels,
  onCancel,
  onSubmit,
}: ForgotPasswordFormProps) {
  const [usernameOrEmail, setUsernameOrEmail] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usernameOrEmail.trim()) {
      toast.error(labels.identifierRequired);
      return;
    }

    setIsPending(true);
    try {
      const result = await onSubmit(usernameOrEmail.trim());
      if (result.success === false) {
        toast.error(result.message || labels.identifierRequired);
        return;
      }
      toast.success(
        result.message ||
          (result.email
            ? labels.resetEmailSent(result.email)
            : labels.sendResetLink),
      );
      onCancel();
    } catch (error: any) {
      toast.error(error?.message);
      setUsernameOrEmail("");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <AuthFormHeader title={labels.title} description={labels.description} />

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{labels.emailOrUsername}</Label>
          <Input
            id="email"
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            disabled={isPending}
          />
        </div>

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
            {isPending ? labels.sending : labels.sendResetLink}
          </Button>
        </div>
      </form>
    </div>
  );
}
