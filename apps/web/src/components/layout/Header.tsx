import { cn } from "@/lib/utils";

import { ThemeSwitcher } from "../shared/ThemeSwitcher";
import { useTheme } from "next-themes";
import { UserNav } from "./UserNav";
import { SidebarTrigger } from "../ui/sidebar";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-2 border-b px-4",
        className,
      )}
    >
      <div className="flex flex-row justify-between w-full">
        <SidebarTrigger />
        <div className="flex flex-row gap-4">
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
