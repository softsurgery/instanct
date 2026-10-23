import { useRouter } from "next/router";
import { ConfigurationEditPortal } from "@/components/content-management/configuration/ConfigurationEditPortal";

export default function ConfigurationEditPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return null;
  }

  return <ConfigurationEditPortal id={id} />;
}
