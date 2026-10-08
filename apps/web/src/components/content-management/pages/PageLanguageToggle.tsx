import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@instanct/ui";
import { SelectOption } from "@instanct/form-builder";

interface PageLanguageToggleProps {
  value: string;
  onValueChange: (code: string) => void;
  languages?: SelectOption[];
  className?: string;
}

export function PageLanguageToggle({
  value,
  onValueChange,
  languages,
  className,
}: PageLanguageToggleProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-8", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" side="left">
        {languages?.map((lang) => (
          <SelectItem key={String(lang.value)} value={String(lang.value)}>
            {lang.label || String(lang.value).toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
