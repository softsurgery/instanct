import { useRouter } from "next/router";
import { ContentPageEditPortal } from "@/components/content-management/pages/ContentPageEditPortal";

export default function ContentPageEditPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return null;
  }

  return <ContentPageEditPortal id={id} />;
}
