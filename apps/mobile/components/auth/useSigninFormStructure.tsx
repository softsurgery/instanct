import { AuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";
import {
  EmailFieldProps,
  Field,
  FieldVariant,
  FormStructure,
} from "@softsurgery/mobile-form-builder";

interface useSignInFormStructureProps {
  store: AuthStore;
  isPending?: boolean;
}

export const useSignInFormStructure = ({
  store,
  isPending,
}: useSignInFormStructureProps) => {
  const { t } = useTranslation("auth");

  //email
  const emailField: Field<EmailFieldProps> = {
    id: "email",
    label: t("auth.signIn.labels.email"),
    description: t("auth.signIn.descriptions.email"),
    placeholder: t("auth.signIn.placeholders.email"),
    variant: FieldVariant.EMAIL,
    className: "w-full",
    error: store.signInRequestErrors?.email?.[0]
      ? t(store.signInRequestErrors.email[0])
      : undefined,
    props: {
      value: store.signInRequest.email,
      onChangeText: (value: string) => {
        store.setNested("signInRequest.email", value);
        if (store.signInRequestErrors?.email?.length) {
          store.setNested("signInRequestErrors.email", []);
        }
      },
      onBlur: () => {
        const email = store.signInRequest.email?.trim().toLowerCase();
        if (email && email !== store.signInRequest.email) {
          store.setNested("signInRequest.email", email);
        }
      },
      editable: !isPending,
    },
  };

  //password
  const passwordField: Field = {
    id: "password",
    label: t("auth.signIn.labels.password"),
    description: t("auth.signIn.descriptions.password"),
    variant: FieldVariant.PASSWORD,
    error: store.signInRequestErrors?.password?.[0]
      ? t(store.signInRequestErrors.password[0])
      : undefined,
    props: {
      value: store.signInRequest.password,
      onChangeText: (text: string) => {
        store.setNested("signInRequest.password", text);
        if (store.signInRequestErrors?.password?.length) {
          store.setNested("signInRequestErrors.password", []);
        }
      },
      editable: !isPending,
    },
  };

  const signInFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [emailField, passwordField],
          },
        ],
      },
    ],
  };

  return {
    signInFormStructure,
  };
};
