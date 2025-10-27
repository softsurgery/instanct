import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  className?: string;
  children?: React.ReactNode;
}

export const Layout = ({ className, children }: LayoutProps) => {
  return (
    <div
      className={cn(
        "grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]",
        className
      )}
    >
      {/* Sidebar */}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* header */}
        <Header />
        <main className="flex flex-col flex-1 overflow-hidden gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
