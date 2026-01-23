import { useUserStore } from "@/hooks/stores/useUserStore";
import { Experience } from "../experience/Experience";
import { Education } from "../education/Education";
import { cn } from "@/lib/utils";

interface BookProps {
  className?: string;
}

export const Book = ({ className }: BookProps) => {
  const userStore = useUserStore();
  const user = userStore.response;
  return (
    <div
      className={cn("flex flex-col lg:flex-row gap-4 w-full pb-6", className)}
    >
      {user?.id && <Experience userId={user.id} className="w-full" />}
      {user?.id && <Education userId={user.id} className="w-full" />}
    </div>
  );
};
