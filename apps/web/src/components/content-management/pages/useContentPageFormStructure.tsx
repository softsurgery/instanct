import {
  EditorFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextFieldProps,
  TextareaFieldProps,
} from "@instanct/form-builder";
import { useTranslation } from "react-i18next";
import { ContentPageStore } from "@/hooks/stores/useContentPageStore";

interface useContentPageFormStructureProps {
  contentPageStore: ContentPageStore;
}

export const useContentPageFormStructure = ({
  contentPageStore,
}: useContentPageFormStructureProps) => {
  const { t } = useTranslation("content-management");

  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: t("pages.fields.title"),
    variant: FieldVariant.TEXT,
    required: true,
    className: "w-full",
    error: contentPageStore.updateDtoErrors?.title?.[0],
    props: {
      value: contentPageStore.updateDto.title,
      onChange: (value) => {
        contentPageStore.setNested("updateDto.title", value);
        contentPageStore.setNested("updateDtoErrors.title", []);
      },
    },
  };

  const subtitleField: Field<TextareaFieldProps> = {
    id: "subtitle",
    label: t("pages.fields.subtitle"),
    variant: FieldVariant.TEXTAREA,
    placeholder: "Optional page subtitle",
    error: contentPageStore.updateDtoErrors?.subtitle?.[0],
    className: "h-24",
    props: {
      value: contentPageStore.updateDto.subtitle,
      onChange: (value) => {
        contentPageStore.setNested("updateDto.subtitle", value);
        contentPageStore.setNested("updateDtoErrors.subtitle", []);
      },
    },
  };

  const bodyField: Field<EditorFieldProps> = {
    id: "body",
    label: "Content Body",
    variant: FieldVariant.EDITOR,
    description: t("pages.editor.hint"),
    error: contentPageStore.updateDtoErrors?.body?.[0],
    props: {
      value: contentPageStore.updateDto.body,
      onChange: (value) => {
        contentPageStore.setNested("updateDto.body", value);
        contentPageStore.setNested("updateDtoErrors.body", []);
      },
    },
  };

  const contentPageFormStructure: FormStructure = {
    includeHeader: false,
    fieldsets: [
      {
        includeHeader: false,
        rows: [
          { fields: [titleField] },
          { fields: [subtitleField] },
          { fields: [bodyField] },
        ],
      },
    ],
  };

  return {
    contentPageFormStructure,
  };
};
