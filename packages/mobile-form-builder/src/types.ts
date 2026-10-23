export interface FormStructure {
  title: string;
  description?: string;
  orientation?: "vertical" | "horizontal";
  isHeaderVisible?: boolean;
  fieldsets: Fieldset[];
}

export interface Fieldset {
  title?: string;
  description?: string;
  isHeaderVisible?: boolean;
  rows: FieldsetRow[];
}

export interface FieldsetRow {
  id: number;
  fields: Field[];
}

export interface Field<T = any> {
  id: string;
  label: string;
  className?: string;
  fieldClassName?: string;
  wrapperClassName?: string;
  variant: FieldVariant;
  required?: boolean;
  description?: string;
  placeholder?: string;
  hidden?: boolean;
  error?: string;
  props?: T;
}

export enum FieldVariant {
  TEXT = "text",
  EMAIL = "email",
  TEL = "tel",
  NUMBER = "number",
  PASSWORD = "password",
  MAPPIN = "map-pin",
  DATE = "date",
  TIME = "time",
  SELECT = "select",
  MULTISELECT = "multi-select",
  CHECKBOX = "checkbox",
  CHECK = "check",
  RADIO = "radio",
  TEXTAREA = "textarea",
  SWITCH = "switch",
  RATING = "rating",
  PICTURE = "picture",
  CHOICEPICKER = "choice-picker",
  CUSTOM = "custom",
}

export interface TextFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  editable?: boolean;
}

export interface TextareaFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  rows?: number;
}

export interface EmailFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  editable?: boolean;
}

export interface TelFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

export interface NumberFieldProps {
  value?: number;
  onChangeText?: (text: number) => void;
  editable?: boolean;
}

export interface PasswordFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

export interface MapPinFieldProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
    name: string;
  }) => void;
  editable?: boolean;
  changedOnFocus?: boolean;
}

export interface DateFieldProps {
  placeholder?: string;
  value?: Date;
  onDateChange?: (date: Date) => void;
  editable?: boolean;
  /** Inclusive lower year bound. Defaults to 1920. */
  minYear?: number;
  /** Inclusive upper year bound. Pass `"current"` for this year. Defaults to `"current"`. */
  maxYear?: number | "current";
}

export interface TimeFieldProps {
  placeholder?: string;
  value?: Date;
  onTimeChange?: (time: Date) => void;
  editable?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  value?: string;
  onSelect?: (value: string) => void;
  options?: SelectOption[];
  editable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export interface MultiSelectFieldProps {
  value?: string[];
  onSelect?: (value: string[]) => void;
  options?: SelectOption[];
  editable?: boolean;
  max?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export interface RatingFieldProps {
  value: number;
  onValueChange?: (value: number) => void;
  editable?: boolean;
  color?: string;
  maxStars?: number;
  starSize?: number;
}

export interface MobileUploadFile {
  uri: string;
  name: string;
  type: string;
}

export type UploadFileInput = File | MobileUploadFile;

export type UploadProgressCallback = (percent: number) => void;

export interface PictureFieldProps {
  image?: string | UploadFileInput | null;
  progress?: number;
  alt?: string;
  editable?: boolean;
  onPickStart?: () => void;
  onPickEnd?: () => void;
  onFileChange?: (file: UploadFileInput) => void;
  onUpload?: (
    file: UploadFileInput,
    onProgress?: UploadProgressCallback,
  ) => void;
}

export interface RadioFieldProps {
  checked?: string;
  onCheckedChange?: (checked: string) => void;
  editable?: boolean;
  options: SelectOption[];
  itemWidthClass?: string;
}
export interface CheckboxFieldProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  editable?: boolean;
}

export interface SwitchFieldProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  editable?: boolean;
}

export interface ChoicePickerFieldProps {
  value?: string;
  onSelectChange?: (value: string) => void;
  options?: SelectOption[];
  editable?: boolean;
}

export interface CustomFieldProps {
  children?: React.ReactNode;
}
