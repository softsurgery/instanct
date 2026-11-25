import { Gender } from "api-client";
import { type UploadFilesMutate } from "api-client/hooks";
import {
  CustomFieldProps,
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  TextareaFieldProps,
  TextFieldProps,
  UploadFileInput,
  UploadProgressCallback,
} from "@softsurgery/mobile-form-builder";
import { UserStore } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";
import { UpdateProfileAvatar } from "./UpdateProfileAvatar";

interface useUpdateProfileFormStructureProps {
  store: UserStore;
  fallback?: string;
  uploadPicture: UploadFilesMutate;
  isProfilePictureUploadPending: boolean;
  isPending?: boolean;
  onPickStart?: () => void;
  onPickEnd?: () => void;
}

export const useUpdateProfileFormStructure = ({
  store,
  fallback,
  uploadPicture,
  isProfilePictureUploadPending,
  isPending = false,
  onPickStart,
  onPickEnd,
}: useUpdateProfileFormStructureProps) => {
  const { t } = useTranslation("settings");
  const { isLandscape } = useScreenOrientation();

  // picture
  const pictureField: Field<CustomFieldProps> = {
    id: "picture",
    label: t("settings.account.screens.profile.form.profile-picture"),
    variant: FieldVariant.CUSTOM,
    description: t(
      "settings.account.screens.profile.form.descriptions.profile-picture",
    ),
    fieldClassName: "w-full",
    props: {
      children: (
        <UpdateProfileAvatar
          image={store?.picture}
          progress={store?.progress}
          fallback={fallback}
          editable={!isProfilePictureUploadPending && !isPending}
          wrapperClassName="flex flex-row items-center justify-center"
          className={
            isLandscape
              ? "h-28 w-28 rounded-full my-2"
              : "h-40 w-40 rounded-full my-2"
          }
          onPickStart={onPickStart}
          onPickEnd={onPickEnd}
          onFileChange={(value: UploadFileInput) => {
            store.set("picture", value);
          }}
          onUpload={(
            file: UploadFileInput,
            onProgress?: UploadProgressCallback,
          ) => {
            store.set("progress", 0);
            uploadPicture({
              files: [file],
              onProgress: (progress: number) => {
                store.set("progress", progress);
                onProgress?.(progress);
              },
            });
          }}
          onRemove={() => {
            store.set("picture", undefined);
            store.setNested("updateDto.pictureId", null);
          }}
        />
      ),
    },
  };

  //name
  const firstNameField: Field<TextFieldProps> = {
    id: "firstName",
    label: t("settings.account.screens.profile.form.first-name"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t(
      "settings.account.screens.profile.form.placeholders.first-name",
    ),
    description: t(
      "settings.account.screens.profile.form.descriptions.first-name",
    ),
    error: t(store?.errors?.firstName?.[0]),
    props: {
      editable: !isPending,
      value: store?.updateDto?.firstName,
      onChangeText: (value: string) => {
        store.setNested("updateDto.firstName", value);
        store.setNested("errors.firstName", []);
      },
    },
  };

  //surname
  const lastNameField: Field<TextFieldProps> = {
    id: "lastName",
    label: t("settings.account.screens.profile.form.last-name"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t(
      "settings.account.screens.profile.form.placeholders.last-name",
    ),
    description: t(
      "settings.account.screens.profile.form.descriptions.last-name",
    ),
    error: t(store?.errors?.lastName?.[0]),
    props: {
      editable: !isPending,
      value: store?.updateDto?.lastName,
      onChangeText: (value: string) => {
        store.setNested("updateDto.lastName", value);
        store.setNested("errors.lastName", []);
      },
    },
  };

  // date of birth
  const dateOfBirthField: Field<DateFieldProps> = {
    id: "dateOfBirth",
    label: t("settings.account.screens.profile.form.date-of-birth"),
    variant: FieldVariant.DATE,
    placeholder: t(
      "settings.account.screens.profile.form.placeholders.date-of-birth",
    ),
    description: t(
      "settings.account.screens.profile.form.descriptions.date-of-birth",
    ),
    error: t(store?.errors?.dateOfBirth?.[0]),
    props: {
      editable: !isPending,
      value: store?.updateDto?.dateOfBirth,
      onDateChange: (value: Date) => {
        store.setNested("updateDto.dateOfBirth", value);
        store.setNested("errors.dateOfBirth", []);
      },
    },
  };

  //bio
  const bioField: Field<TextareaFieldProps> = {
    id: "bio",
    label: t("settings.account.screens.profile.form.bio"),
    variant: FieldVariant.TEXTAREA,
    placeholder: t("settings.account.screens.profile.form.placeholders.bio"),
    description: t("settings.account.screens.profile.form.descriptions.bio"),
    error: t(store?.errors?.bio?.[0]),
    props: {
      editable: !isPending,
      value: store?.updateDto?.bio,
      onChangeText: (value: string) => {
        store.setNested("updateDto.bio", value);
        store.setNested("errors.bio", []);
      },
    },
  };

  //gender
  const genderField: Field<SelectFieldProps> = {
    id: "gender",
    label: t("settings.account.screens.profile.form.gender"),
    variant: FieldVariant.SELECT,
    placeholder: t("settings.account.screens.profile.form.placeholders.gender"),
    description: t("settings.account.screens.profile.form.descriptions.gender"),
    error: t(store?.errors?.gender?.[0]),
    props: {
      editable: !isPending,
      value: store?.updateDto?.gender?.toString(),
      onSelect: (value: string) => {
        store.setNested("updateDto.gender", value);
        store.setNested("errors.gender", []);
      },
      options: Object.entries(Gender).map(([value, label]) => ({
        label: label as string,
        value,
      })),
    },
  };

  //website
  const websiteField: Field<TextFieldProps> = {
    id: "website",
    label: t("settings.account.screens.profile.form.website"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: t(
      "settings.account.screens.profile.form.placeholders.website",
    ),
    description: t(
      "settings.account.screens.profile.form.descriptions.website",
    ),
    error: t(store?.errors?.website?.[0]),
    props: {
      value: store?.updateDto?.website,
      onChangeText: (value: string) => {
        store.setNested("updateDto.website", value);
        store.setNested("errors.website", []);
      },
    },
  };

  //linkedin
  const linkedinField: Field<TextFieldProps> = {
    id: "linkedin",
    label: t("settings.account.screens.profile.form.linkedin"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: t(
      "settings.account.screens.profile.form.placeholders.linkedin",
    ),
    description: t(
      "settings.account.screens.profile.form.descriptions.linkedin",
    ),
    error: t(store?.errors?.linkedin?.[0]),
    props: {
      value: store?.updateDto?.linkedin,
      onChangeText: (value: string) => {
        store.setNested("updateDto.linkedin", value);
        store.setNested("errors.linkedin", []);
      },
    },
  };

  const structure: FormStructure = {
    title: t("settings.account.screens.profile.title"),
    fieldsets: [
      {
        title: t("settings.account.screens.profile.form.personal-information"),
        rows: [
          {
            id: 1,
            fields: [pictureField],
            className: "flex flex-row items-center justify-center",
          },
          {
            id: 2,
            fields: [firstNameField, lastNameField],
          },
          {
            id: 3,
            fields: [dateOfBirthField],
          },
          {
            id: 4,
            fields: [bioField],
          },
          {
            id: 5,
            fields: [genderField],
          },
          {
            id: 6,
            fields: [websiteField],
          },
          {
            id: 7,
            fields: [linkedinField],
          },
        ],
      },
    ],
  };
  return { structure };
};
