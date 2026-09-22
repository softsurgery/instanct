import { cn } from "@instanct/ui";

export interface AuthenticationLayoutProps {
  className?: string;
  brandName: string;
  brandIcon: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthenticationLayout({
  className,
  brandName,
  brandIcon,
  imageSrc = "/auth-hero.jpg",
  imageAlt = "",
  toolbar,
  children,
}: AuthenticationLayoutProps) {
  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)}>
      <div className="flex flex-col gap-4 overflow-auto p-6 md:p-10">
        <div className="flex items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {brandIcon}
            </div>
            {brandName}
          </a>
          {toolbar ? (
            <div className="flex items-center gap-2">{toolbar}</div>
          ) : null}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}
