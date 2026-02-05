import {
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  TextFieldProps,
  TextareaFieldProps,
} from "@/components/shared/form-builder/types";
import { ExperienceStore } from "@/hooks/stores/useExperienceStore";
import { LocationTypes, WorkTypes } from "@/types/user-management";
import { useTranslation } from "react-i18next";

interface useCreateExperienceFormStructureProps {
  experienceStore: ExperienceStore;
}

export const useCreateExperienceFormStructure = ({
  experienceStore,
}: useCreateExperienceFormStructureProps) => {
  const { t } = useTranslation("user-management");

  // Title field
  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: t("userManagement.inspect.books.experience.forms.title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.titlePlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.titleDescription",
    ),
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
    label: t("userManagement.inspect.books.experience.forms.company"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.companyPlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.companyDescription",
    ),
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
    label: t("userManagement.inspect.books.experience.forms.startDate"),
    variant: FieldVariant.DATE,
    required: true,
    placeholder: "YYYY-MM-DD",
    description: t(
      "userManagement.inspect.books.experience.forms.startDateDescription",
    ),
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
    label: t("userManagement.inspect.books.experience.forms.endDate"),
    variant: FieldVariant.DATE,
    required: false,
    placeholder: "YYYY-MM-DD",
    description: t(
      "userManagement.inspect.books.experience.forms.endDateDescription",
    ),
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
    label: t("userManagement.inspect.books.experience.forms.description"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.descriptionPlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.descriptionDescription",
    ),
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

  const locationTypeField: Field<SelectFieldProps> = {
    id: "locationType",
    label: t("userManagement.inspect.books.experience.forms.locationType"),
    variant: FieldVariant.SELECT,
    required: false,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.locationTypePlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.locationTypeDescription",
    ),
    error: t(experienceStore.createDtoErrors?.locationType?.[0]),
    props: {
      value: experienceStore.createDto.locationType || undefined,
      onValueChange: (value) => {
        experienceStore.setNested("createDto.locationType", value);
        experienceStore.setNested("createDtoErrors.locationType", []);
      },
      options: Object.values(LocationTypes).map((type) => ({
        label: t(
          `userManagement.inspect.books.experience.forms.locationTypes.${type}`,
        ),
        value: type,
      })),
    },
  };

  const locationField: Field<TextFieldProps> = {
    id: "location",
    label: t("userManagement.inspect.books.experience.forms.location"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.locationPlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.locationDescription",
    ),
    error: t(experienceStore.createDtoErrors?.location?.[0]),
    props: {
      value: experienceStore.createDto.location || undefined,
      // disabled: experienceStore.createDto.locationType === "Remote",

      onChange: (value) => {
        experienceStore.setNested("createDto.location", value);
        experienceStore.setNested("createDtoErrors.location", []);
      },
    },
  };

  const workTypeField: Field<SelectFieldProps> = {
    id: "workType",
    label: t("userManagement.inspect.books.experience.forms.workType"),
    variant: FieldVariant.SELECT,
    required: false,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.workTypePlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.workTypeDescription",
    ),
    error: t(experienceStore.createDtoErrors?.workType?.[0]),
    props: {
      value: experienceStore.createDto.workType || undefined,
      onValueChange: (value) => {
        console.log("workType changed:", value);

        experienceStore.setNested("createDto.workType", value);
        experienceStore.setNested("createDtoErrors.workType", []);
      },
      options: Object.values(WorkTypes).map((type) => ({
        label: t(
          `userManagement.inspect.books.experience.forms.workTypes.${type}`,
        ),
        value: type,
      })),
    },
  };

  const experienceCreateFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "horizontal",
    fieldsets: [
      {
        title: t("userManagement.inspect.books.experience.forms.title"),
        description: "",
        includeHeader: true,
        rows: [
          { fields: [titleField, companyField] },
          { fields: [startDateField, endDateField] },
          { fields: [workTypeField] },
          { fields: [descriptionField] },
          { fields: [locationField, locationTypeField] },
        ],
      },
    ],
  };

  return {
    experienceCreateFormStructure,
  };
};
