import { AuthStore } from "@/stores/useAuthStore";
import { type UploadFilesMutate } from "@/hooks/useUploadMutation";
import {
  Field,
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
  PictureFieldProps,
  SelectOption,
  TextFieldProps,
  UploadFileInput,
  UploadProgressCallback,
} from "@softsurgery/mobile-form-builder";
import { cn, identifyUserAvatar } from "@softsurgery/lib";
import { useTranslation } from "react-i18next";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
} from "@/hooks/useAuthValidation";

interface useSignUpFormStructureProps {
  store: AuthStore;
  isPending?: boolean;
  usernameValidation: {
    usernameError: string | null;
    isUsernameTaken: boolean;
    isCheckingUsername: boolean;
  };
  emailValidation: {
    emailError: string | null;
    isEmailTaken: boolean;
    isCheckingEmail: boolean;
  };
  industriesOptions: SelectOption[];
  uploadPicture: UploadFilesMutate;
  isProfilePictureUploadPending: boolean;
  onPickStart?: () => void;
  onPickEnd?: () => void;
}

export const useSignUpFormStructure = ({
  store,
  isPending,
  usernameValidation: { usernameError, isUsernameTaken, isCheckingUsername },
  emailValidation: { emailError, isEmailTaken, isCheckingEmail },
  industriesOptions,
  uploadPicture,
  isProfilePictureUploadPending,
  onPickStart,
  onPickEnd,
}: useSignUpFormStructureProps) => {
  const { t } = useTranslation("auth");

  // firstName (optional)
  const firstnameField: Field = {
    id: "firstName",
    label: t("auth.signUp.labels.firstName"),
    description: t("auth.signUp.descriptions.firstName"),
    placeholder: t("auth.signUp.placeholders.firstName"),
    variant: FieldVariant.TEXT,
    required: false,
    error: store.signUpRequestErrors?.firstName?.[0]
      ? t(store.signUpRequestErrors.firstName[0])
      : undefined,
    props: {
      value: store.signUpRequest.firstName,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.firstName", text);
        const err = validateFirstName(text);
        store.setNested("signUpRequestErrors.firstName", err ? [err] : []);
      },
      editable: !isPending,
    },
  };

  // lastName (optional)
  const lastnameField: Field = {
    id: "lastName",
    label: t("auth.signUp.labels.lastName"),
    description: t("auth.signUp.descriptions.lastName"),
    placeholder: t("auth.signUp.placeholders.lastName"),
    variant: FieldVariant.TEXT,
    required: false,
    error: store.signUpRequestErrors?.lastName?.[0]
      ? t(store.signUpRequestErrors.lastName[0])
      : undefined,
    props: {
      value: store.signUpRequest.lastName,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.lastName", text);
        const err = validateLastName(text);
        store.setNested("signUpRequestErrors.lastName", err ? [err] : []);
      },
      editable: !isPending,
    },
  };

  // email (required)
  const emailFieldDescription = !store.signUpRequest.email
    ? t("auth.signUp.descriptions.email.default")
    : isCheckingEmail
      ? t("auth.signUp.descriptions.email.checking")
      : isEmailTaken
        ? t("auth.signUp.descriptions.email.taken")
        : t("auth.signUp.descriptions.email.available");

  const emailFieldClassName = cn(
    !isCheckingEmail && isEmailTaken ? "border border-red-500" : "",
  );

  const emailFieldError = store.signUpRequestErrors?.email?.[0]
    ? t(store.signUpRequestErrors.email[0])
    : isEmailTaken
      ? t("auth.signUp.errors.emailTaken")
      : store.signUpRequest.email.length > 0 && emailError
        ? t(emailError)
        : "";

  const emailField: Field = {
    id: "email",
    label: t("auth.signUp.labels.email"),
    description: emailFieldDescription,
    placeholder: t("auth.signUp.placeholders.email"),
    variant: FieldVariant.EMAIL,
    required: true,
    className: emailFieldClassName,
    error: emailFieldError,
    props: {
      value: store.signUpRequest.email,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.email", text);
        if (store.signUpRequestErrors?.email?.length) {
          const err = validateEmail(text);
          store.setNested("signUpRequestErrors.email", err ? [err] : []);
        }
      },
      editable: !isPending,
    },
  };

  // username (required)
  const usernameFieldDescription = !store.signUpRequest.username
    ? t("auth.signUp.descriptions.username.default")
    : isCheckingUsername
      ? t("auth.signUp.descriptions.username.checking")
      : isUsernameTaken
        ? t("auth.signUp.descriptions.username.taken")
        : t("auth.signUp.descriptions.username.available");

  const usernameFieldClassName = cn(
    "w-full",
    !isCheckingUsername && isUsernameTaken ? "border border-red-500" : "",
  );

  const usernameFieldError = store.signUpRequestErrors?.username?.[0]
    ? t(store.signUpRequestErrors.username[0])
    : isUsernameTaken
      ? t("auth.signUp.errors.usernameTaken")
      : store.signUpRequest.username.length > 0 && usernameError
        ? t(usernameError)
        : "";

  const usernameField: Field<TextFieldProps> = {
    id: "username",
    label: t("auth.signUp.labels.username"),
    description: usernameFieldDescription,
    placeholder: t("auth.signUp.placeholders.username"),
    variant: FieldVariant.TEXT,
    required: true,
    className: usernameFieldClassName,
    error: usernameFieldError,
    props: {
      value: store.signUpRequest.username,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.username", text);
        if (store.signUpRequestErrors?.username?.length) {
          const err = validateUsername(text);
          store.setNested("signUpRequestErrors.username", err ? [err] : []);
        }
      },
      editable: !isPending,
    },
  };

  // password (required)
  const passwordField: Field = {
    id: "password",
    label: t("auth.signUp.labels.password"),
    description: t("auth.signUp.descriptions.password"),
    placeholder: t("auth.signUp.placeholders.password"),
    variant: FieldVariant.PASSWORD,
    required: true,
    error: store.signUpRequestErrors?.password?.[0]
      ? t(store.signUpRequestErrors.password[0])
      : undefined,
    props: {
      value: store.signUpRequest.password,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.password", text);
        if (store.signUpRequestErrors?.password?.length) {
          const err = validatePassword(text);
          store.setNested("signUpRequestErrors.password", err ? [err] : []);
        }
        if (store.signUpRequestErrors?.confirmPassword?.length) {
          const cpErr = validateConfirmPassword(
            text,
            store.utilities.confirmPassword,
          );
          store.setNested(
            "signUpRequestErrors.confirmPassword",
            cpErr ? [cpErr] : [],
          );
        }
      },
      editable: !isPending,
    },
  };

  // confirmPassword (required)
  const confirmPasswordField: Field = {
    id: "confirmPassword",
    label: t("auth.signUp.labels.confirmPassword"),
    description: t("auth.signUp.descriptions.confirmPassword"),
    placeholder: t("auth.signUp.placeholders.confirmPassword"),
    variant: FieldVariant.PASSWORD,
    required: true,
    error: store.signUpRequestErrors?.confirmPassword?.[0]
      ? t(store.signUpRequestErrors.confirmPassword[0])
      : undefined,
    props: {
      value: store.utilities.confirmPassword,
      onChangeText: (text: string) => {
        store.setNested("utilities.confirmPassword", text);
        if (store.signUpRequestErrors?.confirmPassword?.length) {
          const err = validateConfirmPassword(
            store.signUpRequest.password,
            text,
          );
          store.setNested(
            "signUpRequestErrors.confirmPassword",
            err ? [err] : [],
          );
        }
      },
      editable: !isPending,
    },
  };

  // FormStructure vertical simple (ancien FormBuilder)
  const signUpFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [
              firstnameField,
              lastnameField,
              emailField,
              usernameField,
              passwordField,
              confirmPasswordField,
            ],
          },
        ],
      },
    ],
  };

  const industriesFormStructure: FormStructure = {
    title: t("auth.signUp.steps.industries.title"),
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [
              {
                id: "industries",
                variant: FieldVariant.MULTISELECT,
                label: "",
                description: t("auth.signUp.descriptions.industries"),
                error: store.signUpRequestErrors?.industries?.[0]
                  ? t(store.signUpRequestErrors.industries[0])
                  : undefined,
                props: {
                  value: store.signUpRequest.industries.map(String),
                  onSelect: (ids) => {
                    store.setNested(
                      "signUpRequest.industries",
                      ids.map(Number),
                    );
                    if (ids.length > 0) {
                      store.setNested("signUpRequestErrors.industries", []);
                    }
                  },
                  options: industriesOptions,
                  max: 5,
                } satisfies MultiSelectFieldProps,
              },
            ],
          },
        ],
      },
    ],
  };

  const pictureField: Field<PictureFieldProps> = {
    id: "picture",
    label: t("auth.signUp.labels.picture"),
    variant: FieldVariant.PICTURE,
    description: t("auth.signUp.descriptions.picture"),
    className: "h-40 w-40 rounded-full mt-2",
    wrapperClassName: "flex flex-row items-center justify-center",
    fieldClassName: "flex flex-col items-center justify-center",
    props: {
      image: store?.utilities.picture,
      progress: store?.utilities.progress,
      alt: identifyUserAvatar({
        username: store.signUpRequest.username,
        firstName: store.signUpRequest.firstName,
        lastName: store.signUpRequest.lastName,
      }),
      editable: !isProfilePictureUploadPending && !isPending,
      onPickStart,
      onPickEnd,
      onFileChange: (value: UploadFileInput) => {
        store.setNested("utilities.picture", value);
      },
      onUpload: (
        file: UploadFileInput,
        onProgress?: UploadProgressCallback,
      ) => {
        store.setNested("utilities.progress", 0);
        uploadPicture({
          files: [file],
          onProgress: (progress: number) => {
            store.setNested("utilities.progress", progress);
            onProgress?.(progress);
          },
        });
      },
    },
  };

  const profilePictureFieldset: FormStructure = {
    title: t("auth.signUp.steps.picture.title"),
    description: t("auth.signUp.descriptions.picture"),
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [pictureField],
          },
        ],
      },
    ],
  };

  return {
    signUpFormStructure,
    industriesFormStructure,
    profilePictureFieldset,
  };
};
