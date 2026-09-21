import { cn } from "@/lib/utils";

import { BreadcrumbCommon, ThemeSwitcher } from "@instanct/components";
import { useBreadcrumb } from "@instanct/contexts";
import { useTheme } from "next-themes";
import { UserNav } from "./UserNav";
import { Separator, SidebarTrigger } from "@instanct/ui";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const { routes } = useBreadcrumb();
  const { theme, setTheme } = useTheme();
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-2 border-b px-4",
        className,
      )}
    >
      <div className="flex flex-row justify-between w-full items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {routes && routes.length > 0 && (
            <>
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbCommon />
            </>
          )}
        </div>
        <div className="flex flex-row gap-4 items-center">
          <ThemeSwitcher
            value={theme as "light" | "dark" | "system"}
            onChange={setTheme}
          />
          <UserNav />
        </div>
      </div>
    </header>
  );
};
