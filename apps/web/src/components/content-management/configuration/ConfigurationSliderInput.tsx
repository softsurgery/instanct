import React from "react";
import { Input, Slider } from "@instanct/ui";
import { cn } from "@/lib/utils";
import { ResponseConfigurationParamDto } from "@/types";
import { useTranslation } from "react-i18next";

export const DEFAULT_MIN_INT = -2147483648;
export const DEFAULT_MAX_INT = 2147483647;

interface ConfigurationSliderInputProps {
  className?: string;
  configurationParam: ResponseConfigurationParamDto;
  value: string;
  onChange: (value: string) => void;
}

function parseNumber(val: unknown): number | undefined {
  if (typeof val === "number" && !Number.isNaN(val)) {
    return val;
  }
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

interface ExtendedConfigurationParamDto
  extends ResponseConfigurationParamDto {
  step?: number;
}

export function getParamBounds(param: ExtendedConfigurationParamDto): {
  min: number;
  max: number;
  step: number;
} {
  let min: number | undefined = parseNumber(param.min);
  let max: number | undefined = parseNumber(param.max);
  let step: number | undefined = parseNumber(param.step);

  let options = param.options;
  if (typeof options === "string") {
    try {
      options = JSON.parse(options);
    } catch {
      // ignore
    }
  }

  if (options && typeof options === "object") {
    if (!Array.isArray(options)) {
      const optObj = options as Record<string, unknown>;
      if (min === undefined) min = parseNumber(optObj.min ?? optObj.minimum);
      if (max === undefined) max = parseNumber(optObj.max ?? optObj.maximum);
      if (step === undefined) step = parseNumber(optObj.step);
    } else {
      for (const rawItem of options as unknown[]) {
        if (!rawItem || typeof rawItem !== "object") continue;
        const item = rawItem as Record<string, unknown>;
        if (min === undefined) {
          if ("min" in item) min = parseNumber(item.min);
          else if (
            (typeof item.label === "string" &&
              item.label.toLowerCase() === "min") ||
            (typeof item.name === "string" &&
              item.name.toLowerCase() === "min") ||
            (typeof item.key === "string" && item.key.toLowerCase() === "min")
          ) {
            min = parseNumber(item.value);
          }
        }
        if (max === undefined) {
          if ("max" in item) max = parseNumber(item.max);
          else if (
            (typeof item.label === "string" &&
              item.label.toLowerCase() === "max") ||
            (typeof item.name === "string" &&
              item.name.toLowerCase() === "max") ||
            (typeof item.key === "string" && item.key.toLowerCase() === "max")
          ) {
            max = parseNumber(item.value);
          }
        }
        if (step === undefined) {
          if ("step" in item) step = parseNumber(item.step);
          else if (
            (typeof item.label === "string" &&
              item.label.toLowerCase() === "step") ||
            (typeof item.name === "string" &&
              item.name.toLowerCase() === "step") ||
            (typeof item.key === "string" && item.key.toLowerCase() === "step")
          ) {
            step = parseNumber(item.value);
          }
        }
      }
    }
  }

  const resolvedMin = min !== undefined ? min : DEFAULT_MIN_INT;
  const resolvedMax = max !== undefined ? max : DEFAULT_MAX_INT;

  return {
    min: Math.min(resolvedMin, resolvedMax),
    max: Math.max(resolvedMin, resolvedMax),
    step: step !== undefined && step > 0 ? step : 1,
  };
}

export const ConfigurationSliderInput = ({
  className,
  configurationParam,
  value,
  onChange,
}: ConfigurationSliderInputProps) => {
  const { t } = useTranslation("content-management");
  const { min, max, step } = React.useMemo(
    () => getParamBounds(configurationParam),
    [configurationParam],
  );

  const numericValue = React.useMemo(() => {
    if (value === "" || value === undefined || value === null) {
      return min <= 0 && max >= 0 ? 0 : min;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return min <= 0 && max >= 0 ? 0 : min;
    }
    return parsed;
  }, [value, min, max]);

  const clampedSliderValue = Math.min(Math.max(numericValue, min), max);

  const isOutOfRange =
    value !== "" &&
    !Number.isNaN(Number(value)) &&
    (Number(value) < min || Number(value) > max);

  const handleSliderChange = (vals: number[]) => {
    if (vals.length > 0) {
      onChange(String(vals[0]));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (value !== "" && !Number.isNaN(Number(value))) {
      const num = Number(value);
      if (num < min) {
        onChange(String(min));
      } else if (num > max) {
        onChange(String(max));
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 py-1">
          <Slider
            value={[clampedSliderValue]}
            min={min}
            max={max}
            step={step}
            onValueChange={handleSliderChange}
            className="cursor-pointer"
          />
        </div>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-36 font-mono text-sm shrink-0 text-right",
            isOutOfRange &&
              "border-destructive text-destructive focus-visible:ring-destructive/30",
          )}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={t("configuration.inputs.enter", {
            name: configurationParam.name,
          })}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-0.5">
        <button
          type="button"
          className="hover:text-foreground cursor-pointer transition-colors focus:outline-hidden"
          onClick={() => onChange(String(min))}
          title="Click to set to Min"
        >
          Min:{" "}
          <span className="font-semibold text-foreground/80">
            {min.toLocaleString()}
          </span>
        </button>
        {isOutOfRange && (
          <span className="text-destructive font-sans font-medium text-xs">
            Out of range [{min.toLocaleString()} to {max.toLocaleString()}]
          </span>
        )}
        <button
          type="button"
          className="hover:text-foreground cursor-pointer transition-colors focus:outline-hidden"
          onClick={() => onChange(String(max))}
          title="Click to set to Max"
        >
          Max:{" "}
          <span className="font-semibold text-foreground/80">
            {max.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};
