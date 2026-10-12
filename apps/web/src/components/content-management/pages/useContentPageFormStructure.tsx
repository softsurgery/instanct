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
  mode?: "create" | "update";
}

export const useContentPageFormStructure = ({
  contentPageStore,
  mode = "update",
}: useContentPageFormStructureProps) => {
  const { t } = useTranslation("content-management");
  const isCreate = mode === "create";

  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: t("pages.fields.title", "Title"),
    placeholder: "e.g. Terms of Service",
    variant: FieldVariant.TEXT,
    required: true,
    className: "w-full",
    error: isCreate
      ? contentPageStore.createDtoErrors?.title?.[0]
      : contentPageStore.updateDtoErrors?.title?.[0],
    props: {
      value: isCreate
        ? contentPageStore.createDto.title
        : contentPageStore.updateDto.title,
      onChange: (value) => {
        if (isCreate) {
          contentPageStore.setNested("createDto.title", value);
          contentPageStore.setNested("createDtoErrors.title", []);
          // Auto-generate slug if not manually altered
          const currentSlug = contentPageStore.createDto.slug;
          const currentTitle = contentPageStore.createDto.title;
          const expectedPrevSlug = (currentTitle || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          if (!currentSlug || currentSlug === expectedPrevSlug) {
            const autoSlug = (value as string)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            contentPageStore.setNested("createDto.slug", autoSlug);
            contentPageStore.setNested("createDtoErrors.slug", []);
          }
        } else {
          contentPageStore.setNested("updateDto.title", value);
          contentPageStore.setNested("updateDtoErrors.title", []);
        }
      },
    },
  };

  const slugField: Field<TextFieldProps> = {
    id: "slug",
    label: t("pages.fields.slug", "Slug"),
    placeholder: "e.g. terms-of-service",
    variant: FieldVariant.TEXT,
    required: true,
    className: "w-full",
    error: contentPageStore.createDtoErrors?.slug?.[0],
    description: "URL path identifier for the page",
    props: {
      value: contentPageStore.createDto.slug,
      onChange: (value) => {
        contentPageStore.setNested("createDto.slug", value);
        contentPageStore.setNested("createDtoErrors.slug", []);
      },
    },
  };

  const subtitleField: Field<TextareaFieldProps> = {
    id: "subtitle",
    label: t("pages.fields.subtitle", "Subtitle"),
    variant: FieldVariant.TEXTAREA,
    placeholder: "Optional page subtitle",
    error: isCreate
      ? contentPageStore.createDtoErrors?.subtitle?.[0]
      : contentPageStore.updateDtoErrors?.subtitle?.[0],
    className: "h-24",
    props: {
      value: isCreate
        ? contentPageStore.createDto.subtitle
        : contentPageStore.updateDto.subtitle,
      onChange: (value) => {
        if (isCreate) {
          contentPageStore.setNested("createDto.subtitle", value);
          contentPageStore.setNested("createDtoErrors.subtitle", []);
        } else {
          contentPageStore.setNested("updateDto.subtitle", value);
          contentPageStore.setNested("updateDtoErrors.subtitle", []);
        }
      },
    },
  };

  const bodyField: Field<EditorFieldProps> = {
    id: "body",
    label: "Content Body",
    variant: FieldVariant.EDITOR,
    description: t("pages.editor.hint"),
    error: isCreate
      ? contentPageStore.createDtoErrors?.body?.[0]
      : contentPageStore.updateDtoErrors?.body?.[0],
    props: {
      value: isCreate
        ? contentPageStore.createDto.body
        : contentPageStore.updateDto.body,
      onChange: (value) => {
        if (isCreate) {
          contentPageStore.setNested("createDto.body", value);
          contentPageStore.setNested("createDtoErrors.body", []);
        } else {
          contentPageStore.setNested("updateDto.body", value);
          contentPageStore.setNested("updateDtoErrors.body", []);
        }
      },
    },
  };

  const rows = isCreate
    ? [
        { fields: [titleField, slugField] },
        { fields: [subtitleField] },
        { fields: [bodyField] },
      ]
    : [
        { fields: [titleField] },
        { fields: [subtitleField] },
        { fields: [bodyField] },
      ];

  const contentPageFormStructure: FormStructure = {
    includeHeader: false,
    fieldsets: [
      {
        includeHeader: false,
        rows,
      },
    ],
  };

  return {
    contentPageFormStructure,
  };
};
