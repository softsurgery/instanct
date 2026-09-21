/* eslint-disable @typescript-eslint/no-explicit-any */
import { SelectOption } from "../types";

interface mapToSelectOptionsProps {
  data: any[];
  labelKey: string;
  valueKey: string;
  labelKeyTransformer?: (label: string) => string;
  valueKeyTransformer?: (value: string | number) => string | number;
}

export const mapToSelectOptions = ({
  data,
  labelKey,
  valueKey,
  labelKeyTransformer = (label: string) => label,
  valueKeyTransformer = (value: string | number) => value,
}: mapToSelectOptionsProps): SelectOption[] => {
  return data.map((item: any) => ({
    label: labelKeyTransformer?.(item?.[labelKey]),
    value: valueKeyTransformer?.(item?.[valueKey]),
  }));
};
