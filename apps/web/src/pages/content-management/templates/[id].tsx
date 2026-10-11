import { useRouter } from "next/router";
import { TemplateEditPortal } from "@softsurgery/template";
import { api } from "@/lib/api";

export default function TemplateEditPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return null;
  }

  return <TemplateEditPortal id={id} api={api.template} />;
}
