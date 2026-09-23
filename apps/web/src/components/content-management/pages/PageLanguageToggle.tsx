import { Button } from "@instanct/ui";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@instanct/ui";
import { Check } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";

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

  const selectedOption = options.find((lang) => lang.code === value) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("flex items-center h-8", className)}
        >
          {selectedOption.label || selectedOption.code.toUpperCase()}
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((lang) => {
          const isSelected = value === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onValueChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{lang.label || lang.code.toUpperCase()}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
