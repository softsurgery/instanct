import { Button, Input, Label } from "@instanct/ui";
import { cn } from "@/lib/utils";
import {
  ConfigurationListFieldSchema,
  ParamVariant,
  ResponseConfigurationParamDto,
} from "@/types";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfigurationListInputProps {
  className?: string;
  configurationParam: ResponseConfigurationParamDto;
  value: string;
  onChange: (value: string) => void;
}

function parseListValue(value?: string): Record<string, string>[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Record<string, string> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    );
  } catch {
    return [];
  }
}

function emptyItem(schema: ConfigurationListFieldSchema[]) {
  return Object.fromEntries(schema.map((field) => [field.key, ""]));
}

export const ConfigurationListInput = ({
  className,
  configurationParam,
  value,
  onChange,
}: ConfigurationListInputProps) => {
  const { t } = useTranslation("content-management");
  const schema = configurationParam.schema ?? [];
  const items = parseListValue(value);

  const emit = (next: Record<string, string>[]) => {
    onChange(JSON.stringify(next));
  };

  const updateItem = (index: number, key: string, fieldValue: string) => {
    emit(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: fieldValue } : item,
      ),
    );
  };

  const addItem = () => {
    emit([...items, emptyItem(schema)]);
  };

  const removeItem = (index: number) => {
    emit(items.filter((_, itemIndex) => itemIndex !== index));
  };

  if (!schema.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("configuration.list.missingSchema")}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.length ? (
        items.map((item, index) => (
          <div
            key={`${configurationParam.id}-${index}`}
            className="rounded-lg border border-border bg-muted/20 p-3 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("configuration.list.item", { index: index + 1 })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeItem(index)}
                aria-label="X"
              >
                <X />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {schema.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  <Input
                    type={
                      field.variant === ParamVariant.NUMBER
                        ? "number"
                        : field.key.toLowerCase().includes("url")
                          ? "url"
                          : "text"
                    }
                    value={item[field.key] ?? ""}
                    onChange={(event) =>
                      updateItem(index, field.key, event.target.value)
                    }
                    placeholder={t("configuration.inputs.enter", {
                      name: field.label,
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("configuration.list.empty")}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={addItem}
      >
        <Plus />
        {t("configuration.list.add")}
      </Button>
    </div>
  );
};
