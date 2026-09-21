import { LoggerPortal } from "@/components/audit-monitoring/Logger/LoggerPortal";

interface ActivityProps {
  className?: string;
  userId?: string;
}

export const Activity = ({ className, userId }: ActivityProps) => {
  return <LoggerPortal userId={userId} className={className} />;
};
