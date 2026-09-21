import React from "react";
import { Field, SelectOption } from "./types";
import {
  Checkbox,
  cn,
  DatePicker,
  Input,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@qlp/ui";
import { ComboboxMultiSelectField } from "./components/ComboboxMultiSelectField";
import { AvatarField } from "./components/AvatarField";
import { PasswordField } from "./components/PasswordField";
import { RichTextField } from "./components/RichTextField";

interface FieldBuilderProps {
  field?: Field<any>;
}

export const FieldBuilder = ({ field }: FieldBuilderProps) => {
  switch (field?.variant) {
    case "text":
    case "email":
    case "url":
      return (
        <Input
          {...field.props}
          className={cn(
            field?.className,
            field.error && "border-destructive focus-visible:ring-destructive",
          )}
          type={field.variant}
          placeholder={field.placeholder}
          value={field.props?.value ?? ""}
          onChange={(event) => {
            field?.props?.onChange?.(event.target.value);
          }}
        />
      );
    // case "tel":
    //   return (
    //     <PhoneInput
    //       {...field.props}
    //       className={cn(
    //         field?.className,
    //         field.error && "border-destructive focus-visible:ring-destructive",
    //       )}
    //       value={field?.props?.value ?? ""}
    //       onChange={(value) => field?.props?.onChange?.(value)}
    //       placeholder={field?.placeholder}
    //     />
    //   );
    case "number":
      return (
        <Input
          {...field.props}
          className={cn(
            field?.className,
            field.error && "border-destructive focus-visible:ring-destructive",
          )}
          type={field.variant}
          min={field.props?.min}
          max={field.props?.max}
          value={field.props?.value ?? ""}
          placeholder={field?.placeholder}
          onChange={(event) => {
            if (event.target.value === "") {
              field?.props?.onChange?.(undefined);
              return;
            }
            const inputValue = Number(event.target.value);
            if (isNaN(inputValue)) return;
            const min = field.props?.min ?? -Infinity;
            const max = field.props?.max ?? Infinity;
            const clampedValue = Math.max(min, Math.min(max, inputValue));
            field?.props?.onChange?.(clampedValue);
          }}
        />
      );
    case "select":
      return (
        <Select
          {...field.props}
          value={field?.props?.value ?? ""}
          onValueChange={(value) => {
            if (value === "__clear__") {
              field?.props?.onValueChange?.(undefined);
            } else {
              field?.props?.onValueChange?.(value);
            }
          }}
          disabled={field?.props?.disabled}
        >
          <SelectTrigger
            id={field.id}
            className={cn(
              "w-full",
              field?.className,
              field.error &&
                "border-destructive focus-visible:ring-destructive",
            )}
          >
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent className="overflow-y-auto max-h-60">
            {field?.props?.nullable && (
              <SelectItem
                value="__clear__"
                className="text-muted-foreground font-thin italic"
              >
                {field.placeholder || "---"}
              </SelectItem>
            )}
            {field?.props?.options?.map((option: SelectOption) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    // case "multi_select": {
    //   const selectedOptions = (field.props?.options || []).filter(
    //     (opt: SelectOption) => field.props?.value?.includes(opt.value),
    //   );
    //   return (
    //     <MultipleSelector
    //       {...field.props}
    //       className={cn("w-full", field?.className)}
    //       options={field.props?.options}
    //       value={selectedOptions}
    //       disabled={field.props?.disabled}
    //       onChange={(value) =>
    //         field?.props?.onValueChange?.(value.map((v: any) => v.value))
    //       }
    //       placeholder={field?.placeholder}
    //       hidePlaceholderWhenSelected={field.props?.hidePlaceholderWhenSelected}
    //       creatable={field.props?.creatable}
    //       emptyIndicator={
    //         <p className="text-center text-sm">{t("table.no_results")}</p>
    //       }
    //     />
    //   );
    // }
    case "combo_box":
      return (
        <ComboboxMultiSelectField
          {...field.props}
          className={cn(
            field?.className,
            field.error &&
              "border-destructive focus-within:ring-destructive/20",
          )}
          placeholder={field.placeholder}
          options={field.props?.options}
          value={field.props?.value}
          disabled={field.props?.disabled}
          onValueChange={field?.props?.onValueChange}
        />
      );

    case "date":
      return (
        <DatePicker
          {...field.props}
          className={cn(
            "w-full",
            field?.className,
            field.error && "border-destructive focus-visible:ring-destructive",
          )}
          value={
            (field?.props?.value &&
              new Date(field?.props?.value as string | Date | number)) ||
            undefined
          }
          placeholder={field.placeholder}
          onDateChange={(value: Date | null) =>
            field?.props?.onDateChange?.(value)
          }
          nullable={field?.props?.nullable}
          disabled={field?.props?.disabled}
        />
      );
    case "checkbox":
      if (field.props?.selectOptions?.length) {
        return (
          <div className="flex flex-col gap-2 my-1">
            {field.props.selectOptions.map((option: SelectOption) => (
              <div key={option.label} className="flex items-center gap-2">
                <Checkbox
                  id={option.label}
                  className={field?.className}
                  checked={field.props?.value}
                  onCheckedChange={(value) =>
                    field?.props?.onCheckedChange?.(value)
                  }
                />
                <Label className="text-sm font-semibold">{option.label}</Label>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2 h-8">
          <Checkbox
            id={field.id}
            className={field?.className}
            disabled={field?.props?.disabled}
            checked={field?.props?.checked ?? field?.props?.value ?? false}
            defaultChecked={field?.props?.defaultChecked}
            onCheckedChange={(value) => field?.props?.onCheckedChange?.(value)}
          />
          <Label className={cn("text-xs")} htmlFor={field.id}>
            {field.description}
          </Label>
        </div>
      );

    case "radio":
      return (
        <RadioGroup
          value={field.props?.value ?? ""}
          className={cn(
            "flex w-fit my-2.5",
            field?.props?.spread === "horizontal" ? "flex-row" : "flex-col",
            field?.className,
          )}
          onValueChange={(value) => {
            field?.props?.onValueChange?.(value);
          }}
        >
          {field.props?.options?.map((option: SelectOption) => (
            <div key={option.value} className="flex items-center gap-3">
              <RadioGroupItem
                value={option.value}
                id={`${field.id}-${option.value}`}
                disabled={field?.props?.disabled}
                className={cn(field?.className)}
              />
              <Label htmlFor={`${field.id}-${option.value}`}>
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    case "password":
      return (
        <PasswordField
          {...field.props}
          className={cn(
            "pr-10",
            field.error && "border-destructive focus-visible:ring-destructive",
            field?.className,
          )}
          value={(field?.props?.value as string) ?? ""}
          onChange={(e) => field?.props?.onChange?.(e.target.value)}
        />
      );
    case "switch":
      return (
        <div className={cn("flex items-center gap-2", field?.className)}>
          <Switch
            {...field.props}
            id={field.label}
            checked={field?.props?.checked ?? field?.props?.value ?? false}
            onCheckedChange={(value) => field?.props?.onCheckedChange?.(value)}
          />{" "}
          <Label className="text-xs font-light">{field.description}</Label>
        </div>
      );
    case "textarea":
      return (
        <Textarea
          {...field.props}
          id={field.id}
          className={cn(
            !field.props?.resizable && "resize-none",
            field?.className,
          )}
          placeholder={field.placeholder}
          value={field.props?.value ?? ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            field?.props?.onChange?.(e.target.value)
          }
        />
      );
    case "editor":
      return <RichTextField field={field} />;
    case "file":
      return (
        <div className={cn("flex flex-col", field?.wrapperClassName)}>
          <Input
            id={field.id}
            type="file"
            accept={field.props?.accept}
            placeholder={field.placeholder}
            className={cn(
              "flex items-center",
              field?.className,
              field.error &&
                "border-destructive focus-visible:ring-destructive",
            )}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                field?.props?.onFileChange?.(file);
                if (field.props?.onUpload) {
                  field.props.onUpload(file, (percent: number) => {
                    field.props.progress = percent;
                  });
                }
              }
            }}
          />
          {typeof field.props?.progress === "number" && (
            <div className="mt-2">
              <Progress value={field.props.progress} />
              <span className="text-xs text-muted-foreground text-center">
                {field.props.progress}%
              </span>
            </div>
          )}
        </div>
      );
    case "avatar":
      return (
        <AvatarField
          id={field.id}
          className={cn(field?.className, field.error && "border-destructive")}
          error={Boolean(field.error)}
          image={field.props?.image}
          progress={field.props?.progress}
          placeholder={field.props?.placeholder}
          fallback={field.props?.fallback}
          accept={field.props?.accept}
          disabled={field.props?.disabled}
          resolveImageUrl={field.props?.resolveImageUrl}
          onFileChange={field.props?.onFileChange}
          onUpload={field.props?.onUpload}
        />
      );

    case "custom":
      return (
        <div className={cn("flex flex-col gap-2", field?.className)}>
          {field.props?.children}
        </div>
      );
    case "empty":
      return null;
    default:
      return (
        <span className="text-xs text-red-500">Cannot Render Element</span>
      );
  }
};
