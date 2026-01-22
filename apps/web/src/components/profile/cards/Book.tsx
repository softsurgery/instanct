import { useUserStore } from "@/hooks/stores/useUserStore";
import { Experience } from "../experience/Experience";
interface BookProps {
  className?: string;
}

export const Book = ({ className }: BookProps) => {
  const userStore = useUserStore();
  const user = userStore.response;
  return (
    <div className={className}>
      {user?.id && <Experience userId={user.id} className="w-full" />}
    </div>
  );
};
