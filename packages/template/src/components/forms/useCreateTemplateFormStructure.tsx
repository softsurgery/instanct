import {
  Field,
  FieldVariant,
  FormStructure,
  TextFieldProps,
} from "@softsurgery/form-builder";
import { TemplateStore } from "../../store/useTemplateStore";
import { useTranslation } from "react-i18next";

interface TemplateCreateFormStructureProps {
  templateStore?: TemplateStore;
}

export const useCreateTemplateFormStructure = ({
  templateStore,
}: TemplateCreateFormStructureProps) => {
  const { t } = useTranslation("content-management");

  const nameField: Field<TextFieldProps> = {
    id: "name",
    label: t("templates.fields.name", "Name"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "e.g. welcome-email",
    description: t(
      "templates.fields.nameDescription",
      "Unique template identifier.",
    ),
    error: templateStore?.templateCreateDtoErrors?.name?.[0],
    props: {
      value: templateStore?.templateCreateDto.name || undefined,
      onChange: (value) => {
        templateStore?.setNested("templateCreateDto.name", value);
        templateStore?.setNested("templateCreateDtoErrors.name", []);
      },
    },
  };

  const contentField: Field<TextFieldProps> = {
    id: "content",
    label: t("templates.fields.content", "HTML / Template Content"),
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: "<!DOCTYPE html>\n<html>\n  <body>...</body>\n</html>",
    description: t(
      "templates.fields.contentDescription",
      "Template HTML code or EJS markup.",
    ),
    error: templateStore?.templateCreateDtoErrors?.content?.[0],
    props: {
      value: templateStore?.templateCreateDto.content || undefined,
      onChange: (value) => {
        templateStore?.setNested("templateCreateDto.content", value);
        templateStore?.setNested("templateCreateDtoErrors.content", []);
      },
    },
  };

  const templateCreateFormStructure: FormStructure = {
    title: "",
    description: "",
    fieldsets: [
      {
        title: t("templates.sheet.create.title", "Create Template"),
        description: t(
          "templates.sheet.create.description",
          "Fill in the details to create a new template.",
        ),
        rows: [
          {
            fields: [nameField],
          },
          {
            fields: [contentField],
          },
        ],
      },
    ],
  };

  return {
    templateCreateFormStructure,
  };
};
