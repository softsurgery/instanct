import { NotificationsPortal } from "@softsurgery/notification-materials/mobile";
import { useNotificationContext } from "@/contexts/NotificationsContext";

export default function Screen() {
  const { resetCount } = useNotificationContext();
  return <NotificationsPortal resetCount={resetCount} />;
}
