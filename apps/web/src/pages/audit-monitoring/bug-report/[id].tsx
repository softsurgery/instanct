import { useRouter } from "next/router";
import { BugUpdateForm } from "@/components/audit-monitoring/BugReport/forms/BugUpdateForm";

export default function BugUpdatePage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return null;
  }

  return <BugUpdateForm id={id} />;
}
