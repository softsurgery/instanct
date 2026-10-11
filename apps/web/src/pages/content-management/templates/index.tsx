import { TemplatesPortal } from "@softsurgery/template";
import { api } from "@/lib/api";

export default function TemplatesPage() {
  return <TemplatesPortal api={api.template} />;
}
