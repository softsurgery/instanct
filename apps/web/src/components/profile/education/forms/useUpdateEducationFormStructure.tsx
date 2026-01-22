import {
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextFieldProps,
  TextareaFieldProps,
} from "@/components/shared/form-builder/types";
import { useTranslation } from "react-i18next";
import { EducationStore } from "../../../../hooks/stores/useEducation.store";

interface useUpdateEducationFormStructureProps {
  educationStore: EducationStore;
}

export const useUpdateEducationFormStructure = ({
  educationStore,
}: useUpdateEducationFormStructureProps) => {
  const { t } = useTranslation("education");

  // Title field
  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: t("education.forms.title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("education.forms.titlePlaceholder"),
    description: t("education.forms.titleDescription"),
    error: t(educationStore.updateDtoErrors?.title?.[0]),
    props: {
      value: educationStore.updateDto.title || undefined,
      onChange: (value) => {
        educationStore.setNested("updateDto.title", value);
        educationStore.setNested("updateDtoErrors.title", []);
      },
    },
  };

  // Institution field
  const institutionField: Field<TextFieldProps> = {
    id: "institution",
    label: t("education.forms.institution"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("education.forms.institutionPlaceholder"),
    description: t("education.forms.institutionDescription"),
    error: t(educationStore.updateDtoErrors?.institution?.[0]),
    props: {
      value: educationStore.updateDto.institution || undefined,
      onChange: (value) => {
        educationStore.setNested("updateDto.institution", value);
        educationStore.setNested("updateDtoErrors.institution", []);
      },
    },
  };

  // Start date field
  const startDateField: Field<DateFieldProps> = {
    id: "startDate",
    label: t("education.forms.startDate"),
    variant: FieldVariant.DATE,
    required: true,
    placeholder: "YYYY-MM-DD",
    description: t("education.forms.startDateDescription"),
    error: t(educationStore.updateDtoErrors?.startDate?.[0]),
    props: {
      value: educationStore.updateDto.startDate || undefined,
      onDateChange: (value: Date | null) => {
        educationStore.setNested("updateDto.startDate", value);
        educationStore.setNested("updateDtoErrors.startDate", []);
      },
      nullable: false,
    },
  };

  // End date field
  const endDateField: Field<DateFieldProps> = {
    id: "endDate",
    label: t("education.forms.endDate"),
    variant: FieldVariant.DATE,
    required: false,
    placeholder: "YYYY-MM-DD",
    description: t("education.forms.endDateDescription"),
    error: t(educationStore.updateDtoErrors?.endDate?.[0]),
    props: {
      value: educationStore.updateDto.endDate || undefined,
      onDateChange: (value: Date | null) => {
        educationStore.setNested("updateDto.endDate", value);
        educationStore.setNested("updateDtoErrors.endDate", []);
      },
      nullable: true,
    },
  };

  // Description field
  const descriptionField: Field<TextareaFieldProps> = {
    id: "description",
    label: t("education.forms.description"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: t("education.forms.descriptionPlaceholder"),
    description: t("education.forms.descriptionDescription"),
    error: t(educationStore.updateDtoErrors?.description?.[0]),
    props: {
      value: educationStore.updateDto.description || undefined,
      onChange: (value) => {
        educationStore.setNested("updateDto.description", value);
        educationStore.setNested("updateDtoErrors.description", []);
      },
      rows: 5,
    },
  };

  const educationUpdateFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    fieldsets: [
      {
        title: t("education.forms.updateTitle"),
        description: "",
        includeHeader: true,
        rows: [
          { fields: [titleField] },
          { fields: [institutionField] },
          { fields: [startDateField] },
          { fields: [endDateField] },
          { fields: [descriptionField] },
        ],
      },
    ],
  };

  return {
    educationUpdateFormStructure,
  };
};
