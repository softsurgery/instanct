import {
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextFieldProps,
  TextareaFieldProps,
} from "@/components/shared/form-builder/types";
import { ExperienceStore } from "@/hooks/stores/useExperienceStore";
import { useTranslation } from "react-i18next";

interface useUpdateExperienceFormStructureProps {
  experienceStore: ExperienceStore;
}

export const useUpdateExperienceFormStructure = ({
  experienceStore,
}: useUpdateExperienceFormStructureProps) => {
  const { t } = useTranslation("experience");

  // Title field
  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: t("experience.forms.title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("experience.forms.titlePlaceholder"),
    description: t("experience.forms.titleDescription"),
    error: t(experienceStore.updateDtoErrors?.title?.[0]),
    props: {
      value: experienceStore.updateDto.title || undefined,
      onChange: (value) => {
        experienceStore.setNested("updateDto.title", value);
        experienceStore.setNested("updateDtoErrors.title", []);
      },
    },
  };

  // Company field
  const companyField: Field<TextFieldProps> = {
    id: "company",
    label: t("experience.forms.company"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("experience.forms.companyPlaceholder"),
    description: t("experience.forms.companyDescription"),
    error: t(experienceStore.updateDtoErrors?.company?.[0]),
    props: {
      value: experienceStore.updateDto.company || undefined,
      onChange: (value) => {
        experienceStore.setNested("updateDto.company", value);
        experienceStore.setNested("updateDtoErrors.company", []);
      },
    },
  };

  // Start date field
  const startDateField: Field<DateFieldProps> = {
    id: "startDate",
    label: t("experience.forms.startDate"),
    variant: FieldVariant.DATE,
    required: true,
    placeholder: "YYYY-MM-DD",
    description: t("experience.forms.startDateDescription"),
    error: t(experienceStore.updateDtoErrors?.startDate?.[0]),
    props: {
      value: experienceStore.updateDto.startDate || undefined,
      onDateChange: (value: Date | null) => {
        experienceStore.setNested("updateDto.startDate", value);
        experienceStore.setNested("updateDtoErrors.startDate", []);
      },
      nullable: false,
    },
  };

  // End date field
  const endDateField: Field<DateFieldProps> = {
    id: "endDate",
    label: t("experience.forms.endDate"),
    variant: FieldVariant.DATE,
    required: false,
    placeholder: "YYYY-MM-DD",
    description: t("experience.forms.endDateDescription"),
    error: t(experienceStore.updateDtoErrors?.endDate?.[0]),
    props: {
      value: experienceStore.updateDto.endDate || undefined,
      onDateChange: (value: Date | null) => {
        experienceStore.setNested("updateDto.endDate", value);
        experienceStore.setNested("updateDtoErrors.endDate", []);
      },
      nullable: true,
    },
  };

  // Description field
  const descriptionField: Field<TextareaFieldProps> = {
    id: "description",
    label: t("experience.forms.description"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: t("experience.forms.descriptionPlaceholder"),
    description: t("experience.forms.descriptionDescription"),
    error: t(experienceStore.updateDtoErrors?.description?.[0]),
    props: {
      value: experienceStore.updateDto.description || undefined,
      onChange: (value) => {
        experienceStore.setNested("updateDto.description", value);
        experienceStore.setNested("updateDtoErrors.description", []);
      },
      rows: 5,
    },
  };

  const experienceUpdateFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    fieldsets: [
      {
        title: t("experience.forms.updateTitle"),
        description: "",
        includeHeader: true,
        rows: [
          { fields: [titleField] },
          { fields: [companyField] },
          { fields: [startDateField] },
          { fields: [endDateField] },
          { fields: [descriptionField] },
        ],
      },
    ],
  };

  return {
    experienceUpdateFormStructure,
  };
};
