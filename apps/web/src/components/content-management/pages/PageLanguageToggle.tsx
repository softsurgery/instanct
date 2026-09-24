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
  const options =
    languages && languages.length > 0
      ? languages
      : [
          { label: "FR", value: "fr" },
          { label: "EN", value: "en" },
        ];

  const selectedOption =
    options.find((lang) => lang.value === value) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("flex items-center h-8", className)}
        >
          {selectedOption.label || selectedOption.value.toUpperCase()}
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((lang) => {
          const isSelected = value === lang.value;
          return (
            <DropdownMenuItem
              key={lang.value}
              onClick={() => onValueChange(lang.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{lang.label || lang.value.toUpperCase()}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
