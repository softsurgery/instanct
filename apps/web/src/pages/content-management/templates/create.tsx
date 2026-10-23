import { TemplateCreatePortal } from "@softsurgery/template";
import { api } from "@/lib/api";

export default function TemplateCreatePage() {
  return <TemplateCreatePortal api={api.template} />;
}
