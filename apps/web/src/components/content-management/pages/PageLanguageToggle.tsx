import { Button } from "@instanct/ui";
import { cn } from "@/lib/utils";

export interface LanguageOption {
  label: string;
  code: string;
}

interface PageLanguageToggleProps {
  value: string;
  onValueChange: (code: string) => void;
  languages?: LanguageOption[];
  className?: string;
}

export function PageLanguageToggle({
  value,
  onValueChange,
  languages,
  className,
}: PageLanguageToggleProps) {
  const options =
    languages && languages.length > 0
      ? languages
      : [
          { label: "FR", code: "fr" },
          { label: "EN", code: "en" },
        ];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted p-0.5 text-muted-foreground",
        className,
      )}
    >
      {options.map((lang) => {
        const isSelected = value === lang.code;
        return (
          <Button
            key={lang.code}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onValueChange(lang.code)}
            className={cn(
              "h-7 px-2.5 text-xs font-semibold uppercase transition-all rounded-md",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-transparent hover:text-foreground opacity-70",
            )}
          >
            {lang.code.toUpperCase()}
          </Button>
        );
      })}
    </div>
  );
}
