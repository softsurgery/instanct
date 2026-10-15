import {
  Field,
  FieldVariant,
  FormStructure,
  TextFieldProps,
} from "@softsurgery/form-builder";
import { TemplateStore } from "../../store/useTemplateStore";
import { useTranslation } from "react-i18next";

interface TemplateUpdateFormStructureProps {
  templateStore?: TemplateStore;
}

export const useUpdateTemplateFormStructure = ({
  templateStore,
}: TemplateUpdateFormStructureProps) => {
  const { t } = useTranslation("content-management");

  const nameField: Field<TextFieldProps> = {
    id: "name",
    label: t("templates.fields.name", "Name"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: "e.g. welcome-email",
    description: t("templates.fields.nameDescription", "Template identifier."),
    error: templateStore?.templateUpdateDtoErrors?.name?.[0],
    props: {
      value: templateStore?.templateUpdateDto.name || undefined,
      onChange: (value) => {
        templateStore?.setNested("templateUpdateDto.name", value);
        templateStore?.setNested("templateUpdateDtoErrors.name", []);
      },
    },
  };

  const contentField: Field<TextFieldProps> = {
    id: "content",
    label: t("templates.fields.content", "HTML / Template Content"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: "<!DOCTYPE html>\n<html>\n  <body>...</body>\n</html>",
    description: t(
      "templates.fields.contentDescription",
      "Template HTML code or EJS markup.",
    ),
    error: templateStore?.templateUpdateDtoErrors?.content?.[0],
    props: {
      value: templateStore?.templateUpdateDto.content || undefined,
      onChange: (value) => {
        templateStore?.setNested("templateUpdateDto.content", value);
        templateStore?.setNested("templateUpdateDtoErrors.content", []);
      },
    },
  };

  const templateUpdateFormStructure: FormStructure = {
    title: "",
    description: "",
    fieldsets: [
      {
        title: t("templates.sheet.update.title", "Update Template"),
        description: t(
          "templates.sheet.update.description",
          "Update the template attributes and content.",
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
    templateUpdateFormStructure,
  };
};
