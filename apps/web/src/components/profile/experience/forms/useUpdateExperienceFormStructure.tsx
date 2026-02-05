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
import { LocationTypes, WorkTypes } from "@/types";
import { useTranslation } from "react-i18next";

interface useUpdateExperienceFormStructureProps {
  experienceStore: ExperienceStore;
}

export const useUpdateExperienceFormStructure = ({
  experienceStore,
}: useUpdateExperienceFormStructureProps) => {
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
    error: t(experienceStore.updateDtoErrors?.title?.[0]),
    props: {
      value: experienceStore.updateDto.title,
      onChange: (value) => {
        experienceStore.setNested("updateDto.title", value);
        experienceStore.setNested("updateDtoErrors.title", []);
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
    error: t(experienceStore.updateDtoErrors?.company?.[0]),
    props: {
      value: experienceStore.updateDto.company,
      onChange: (value) => {
        experienceStore.setNested("updateDto.company", value);
        experienceStore.setNested("updateDtoErrors.company", []);
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
    error: t(experienceStore.updateDtoErrors?.startDate?.[0]),
    props: {
      value: experienceStore.updateDto.startDate,
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
    label: t("userManagement.inspect.books.experience.forms.endDate"),
    variant: FieldVariant.DATE,
    required: false,
    placeholder: "YYYY-MM-DD",
    description: t(
      "userManagement.inspect.books.experience.forms.endDateDescription",
    ),
    error: t(experienceStore.updateDtoErrors?.endDate?.[0]),
    props: {
      value: experienceStore.updateDto.endDate,
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
    label: t("userManagement.inspect.books.experience.forms.description"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: t(
      "userManagement.inspect.books.experience.forms.descriptionPlaceholder",
    ),
    description: t(
      "userManagement.inspect.books.experience.forms.descriptionDescription",
    ),
    error: t(experienceStore.updateDtoErrors?.description?.[0]),
    props: {
      value: experienceStore.updateDto.description,
      onChange: (value) => {
        experienceStore.setNested("updateDto.description", value);
        experienceStore.setNested("updateDtoErrors.description", []);
      },
      rows: 5,
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
    error: t(experienceStore.updateDtoErrors?.location?.[0]),
    props: {
      value: experienceStore.updateDto.location || "",
      disabled: experienceStore.updateDto.locationType === LocationTypes.REMOTE,
      onChange: (value) => {
        experienceStore.setNested("updateDto.location", value);
        experienceStore.setNested("updateDtoErrors.location", []);
      },
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
    error: t(experienceStore.updateDtoErrors?.locationType?.[0]),
    props: {
      value: experienceStore.updateDto.locationType,
      onValueChange: (value) => {
        console.log("locationType changed:", value);

        experienceStore.setNested("updateDto.locationType", value);
        experienceStore.setNested("updateDtoErrors.locationType", []);

        experienceStore.setNested("updateDto.location", undefined);
        experienceStore.setNested("updateDtoErrors.location", []);
      },
      options: Object.values(LocationTypes).map((type) => ({
        label: t(
          `userManagement.inspect.books.experience.forms.locationTypes.${type}`,
        ),
        value: type,
      })),
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
    error: t(experienceStore.updateDtoErrors?.workType?.[0]),
    props: {
      value: experienceStore.updateDto.workType,
      onValueChange: (value) => {
        experienceStore.setNested("updateDto.workType", value);
        experienceStore.setNested("updateDtoErrors.workType", []);
      },
      options: Object.values(WorkTypes).map((type) => ({
        label: t(
          `userManagement.inspect.books.experience.forms.workTypes.${type}`,
        ),
        value: type,
      })),
    },
  };

  const experienceUpdateFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "horizontal",
    fieldsets: [
      {
        title: t("userManagement.inspect.books.experience.forms.updateTitle"),
        description: "",
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
    experienceUpdateFormStructure,
  };
};
