import { CheckedState } from "@radix-ui/react-checkbox";

export interface FormStructure {
  title?: {
    value: string;
    className?: string;
  };
  description?: {
    value: string;
    className?: string;
  };
  orientation?: "vertical" | "horizontal";
  includeHeader?: boolean;
  fieldsets: Fieldset[];
  toggleableFieldsets?: boolean;
  gap?: number;
}

export interface Fieldset {
  title?: {
    value: string;
    className?: string;
  };
  description?: {
    value: string;
    className?: string;
  };
  component?: React.ReactNode;
  includeHeader?: boolean;
  rows: FieldsetRow[];
  gap?: number;
}

export interface FieldsetRow {
  className?: string;
  fields: Field[];
  gap?: number;
}

export enum FieldVariant {
  TEXT = "text",
  EMAIL = "email",
  TEL = "tel",
  NUMBER = "number",
  URL = "url",
  PASSWORD = "password",
  DATE = "date",
  SELECT = "select",
  MULTI_SELECT = "multi_select",
  COMBO_BOX = "combo_box",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SWITCH = "switch",
  TEXTAREA = "textarea",
  EDITOR = "editor",
  FILE = "file",
  AVATAR = "avatar",
  EMPTY = "empty",
  CUSTOM = "custom",
}

export type FieldErrors = Record<string, string[] | undefined>;

export interface Field<T = any> {
  id: string;
  label?: string;
  className?: string;
  wrapperClassName?: string;
  variant: FieldVariant;
  required?: boolean;
  description?: string;
  placeholder?: string;
  hidden?: boolean;
  pending?: boolean;
  error?: string;
  props?: T;
}

export interface BaseFieldProps {
  disabled?: boolean;
}

export interface TextFieldProps extends BaseFieldProps {
  value?: string | null;
  onChange?: (e: string) => void;
  maxLength?: number;
}

export interface EmailFieldProps extends BaseFieldProps {
  value?: string | null;
  onChange?: (e: string) => void;
}

export interface TelFieldProps extends BaseFieldProps {
  value?: string | null;
  onChange?: (e: string) => void;
}

export interface NumberFieldProps extends BaseFieldProps {
  value?: number | null;
  onChange?: (e: number | undefined) => void;
  min?: number;
  max?: number;
}

export interface PasswordFieldProps extends BaseFieldProps {
  value?: string;
  onChange?: (e: string) => void;
}

export interface DateFieldProps extends BaseFieldProps {
  value?: Date | null;
  onDateChange?: (e: Date | null) => void;
  nullable?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps extends BaseFieldProps {
  value?: string | null;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  nullable?: boolean;
}

export interface MultiSelectFieldProps extends BaseFieldProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  options?: SelectOption[];
  hidePlaceholderWhenSelected?: boolean;
}

export interface ComboBoxFieldProps extends BaseFieldProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  options?: SelectOption[];
}

export interface RadioFieldProps extends BaseFieldProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  spread?: "horizontal" | "vertical";
}

export interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (e: CheckedState) => void;
}

export interface SwitchFieldProps extends BaseFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (e: boolean) => void;
}

export interface TextareaFieldProps extends BaseFieldProps {
  value?: string;
  onChange?: (e: string) => void;
  cols?: number;
  rows?: number;
  resizable?: boolean;
  maxLength?: number;
}

export interface EditorFieldProps extends BaseFieldProps {
  value?: string;
  onChange?: (e: string) => void;
  maxLength?: number;
  height?: number | string;
  autoHeight?: boolean;
}

export interface FileFieldProps extends BaseFieldProps {
  accept?: string;
  progress?: number;
  onFileChange?: (file: File) => void;
  onUpload?: (file: File, onProgress: (percent: number) => void) => void;
}

export type AvatarFieldSource =
  | File
  | string
  | {
      slug?: string;
      id?: number;
      url?: string;
    }
  | null;

export interface AvatarFieldProps extends BaseFieldProps {
  image?: AvatarFieldSource;
  progress?: number;
  placeholder?: string;
  fallback?: string;
  accept?: string;
  resolveImageUrl?: (
    image: Exclude<AvatarFieldSource, File | string | null | undefined>,
  ) => string | Promise<string>;
  onFileChange?: (file: File) => void;
  onUpload?: (
    file: File,
    onProgress: (percent: number) => void,
  ) => void | Promise<void>;
}

export interface CustomFieldProps extends BaseFieldProps {
  className?: string;
  children: React.ReactNode;
  includeLabel?: boolean;
}

export interface EmptyFieldProps {}
