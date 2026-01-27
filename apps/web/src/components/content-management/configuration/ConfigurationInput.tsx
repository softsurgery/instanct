import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ParamVariant, ResponseConfigurationParamDto } from "@/types";

interface ConfigurationInputProps {
  className?: string;
  configurationParam: ResponseConfigurationParamDto;
}

export const ConfigurationInput = ({
  className,
  configurationParam,
}: ConfigurationInputProps) => {
  switch (configurationParam.variant) {
    case ParamVariant.STRING:
      return (
        <Input
          className={cn(
            "col-span-2 rounded-md border px-3 py-2 text-sm",
            className,
          )}
          value={configurationParam.value}
          onChange={(e) => {
            console.log(configurationParam.id, e.target.value);
          }}
        />
      );
    case ParamVariant.NUMBER:
      return (
        <Input
          type="number"
          className={cn(
            "col-span-2 rounded-md border px-3 py-2 text-sm",
            className,
          )}
          value={configurationParam.value}
          onChange={(e) => {
            console.log(configurationParam.id, e.target.value);
          }}
        />
      );
    case ParamVariant.SELECT:
      return (
        <Select
          value={configurationParam.value}
          onValueChange={(v) => console.log(configurationParam.id, v)}
        >
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {configurationParam.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return null;
  }
};
