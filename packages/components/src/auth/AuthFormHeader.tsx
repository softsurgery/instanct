import { cn } from "@instanct/ui";

interface AuthFormHeaderProps {
  className?: string;
  title: string;
  description: string;
}

export function AuthFormHeader({
  className,
  title,
  description,
}: AuthFormHeaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2 text-center", className)}
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-balance text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
