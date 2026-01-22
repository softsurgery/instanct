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

interface useCreateExperienceFormStructureProps {
  experienceStore: ExperienceStore;
}

export const useCreateExperienceFormStructure = ({
  experienceStore,
}: useCreateExperienceFormStructureProps) => {
  const { t } = useTranslation("experience");

  // Title field
  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: t("experience.forms.title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("experience.forms.titlePlaceholder"),
    description: t("experience.forms.titleDescription"),
    error: t(experienceStore.createDtoErrors?.title?.[0]),
    props: {
      value: experienceStore.createDto.title || undefined,
      onChange: (value) => {
        experienceStore.setNested("createDto.title", value);
        experienceStore.setNested("createDtoErrors.title", []);
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
    error: t(experienceStore.createDtoErrors?.company?.[0]),
    props: {
      value: experienceStore.createDto.company || undefined,
      onChange: (value) => {
        experienceStore.setNested("createDto.company", value);
        experienceStore.setNested("createDtoErrors.company", []);
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
    error: t(experienceStore.createDtoErrors?.startDate?.[0]),
    props: {
      value: experienceStore.createDto.startDate || undefined,
      onDateChange: (value: Date | null) => {
        experienceStore.setNested("createDto.startDate", value);
        experienceStore.setNested("createDtoErrors.startDate", []);
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
    error: t(experienceStore.createDtoErrors?.endDate?.[0]),
    props: {
      value: experienceStore.createDto.endDate || undefined,
      onDateChange: (value: Date | null) => {
        experienceStore.setNested("createDto.endDate", value);
        experienceStore.setNested("createDtoErrors.endDate", []);
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
    error: t(experienceStore.createDtoErrors?.description?.[0]),
    props: {
      value: experienceStore.createDto.description || undefined,
      onChange: (value) => {
        experienceStore.setNested("createDto.description", value);
        experienceStore.setNested("createDtoErrors.description", []);
      },
      rows: 5,
    },
  };

  const experienceCreateFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "horizontal",
    fieldsets: [
      {
        title: t("experience.forms.title"),
        description: "",
        includeHeader: true,
        rows: [
          { fields: [titleField, companyField] },
          { fields: [startDateField, endDateField] },
          { fields: [descriptionField] },
        ],
      },
    ],
  };

  return {
    experienceCreateFormStructure,
  };
};
