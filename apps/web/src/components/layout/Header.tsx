import { cn } from "@/lib/utils";

import {
  BreadcrumbCommon,
  ThemeSwitcher,
  LanguageSwitcher,
} from "@instanct/components";
import { useBreadcrumb } from "@instanct/contexts";
import { useTheme } from "next-themes";
import { UserNav } from "./UserNav";
import { Separator, SidebarTrigger } from "@instanct/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const { routes } = useBreadcrumb();
  const { theme, setTheme } = useTheme();

  const { data: config } = useQuery({
    queryKey: ["configuration", "application"],
    queryFn: () => api.admin.configuration.findOneById("application"),
  });

  const languagesParam = config?.params?.find((p) => p.name === "languages");
  const languages = languagesParam?.value
    ? JSON.parse(languagesParam.value)
    : undefined;

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
          <LanguageSwitcher languages={languages} />
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
