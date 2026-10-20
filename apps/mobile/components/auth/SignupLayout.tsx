import { cn } from "@softsurgery/lib";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "expo-router";
import { View } from "react-native";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { useSignUpFormStructure } from "./useSignupFormStructure";
import { AcceptTerms } from "./AcceptTerms";
import { StableSafeAreaView } from "@softsurgery/mobile-components";
import { ApplicationHeader } from "@softsurgery/mobile-components";
import { Stepper } from "@softsurgery/mobile-components";
import React from "react";
import {
  useAuthValidation,
  validateFirstName,
  validateLastName,
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
} from "@/hooks/useAuthValidation";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { ServerErrorResponse, Upload } from "@softsurgery/api-client";
import { toast } from "sonner-native";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";
import { useTranslation } from "react-i18next";
import { AppHeaderBack } from "@softsurgery/mobile-components";

interface SignupLayoutProps {
  className?: string;
}

export const SignupLayout = ({ className }: SignupLayoutProps) => {
  const api = useApi();
  const { t } = useTranslation("auth");
  const authStore = useAuthStore();
  const { industries } = useIndustries();

  const {
    uploadFiles: uploadProfilePicture,
    isUploadPending: isProfilePictureUploadPending,
  } = useUploadMutation({
    onSuccess: (response: Upload[]) => {
      authStore.setNested("signUpRequest.pictureId", response?.[0]?.id);
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || t("auth.signUp.toasts.uploadError"),
        {},
      );
    },
  });

  const { usernameValidation, emailValidation } = useAuthValidation();

  const {
    signUpFormStructure,
    industriesFormStructure,
    profilePictureFieldset,
  } = useSignUpFormStructure({
    store: authStore,
    usernameValidation,
    emailValidation,
    industriesOptions: industries.map((industry) => ({
      label: industry.label,
      value: String(industry.id),
    })),
    uploadPicture: uploadProfilePicture,
    isProfilePictureUploadPending,
  });

  React.useEffect(() => {
    return () => {
      authStore.reset();
    };
  }, []);

  const { mutate: signUp, isPending: isSignUpPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        ...authStore.signUpRequest,
        firstName: authStore.signUpRequest.firstName?.trim() || undefined,
        lastName: authStore.signUpRequest.lastName?.trim() || undefined,
      };
      return api.clientAuth.signUp(payload);
    },
    onSuccess: () => {
      toast.success(t("auth.signUp.toasts.success"));
      router.push("/auth/sign-in");
    },
    onError: (error: ServerErrorResponse) => {
      const message =
        error.response?.data?.message || t("auth.signUp.toasts.error");
      toast.error(message);
    },
  });

  const validateStep1 = () => {
    const fnError = validateFirstName(authStore.signUpRequest.firstName);
    const lnError = validateLastName(authStore.signUpRequest.lastName);
    const emError = validateEmail(authStore.signUpRequest.email);
    const unError = validateUsername(authStore.signUpRequest.username);
    const pwError = validatePassword(authStore.signUpRequest.password);
    const cpError = validateConfirmPassword(
      authStore.signUpRequest.password,
      authStore.utilities.confirmPassword,
    );
    const termsError = !authStore.utilities.acceptedTerms
      ? "auth.validation.signUp.termsRequired"
      : null;

    const errors: Record<string, string[]> = {};
    if (fnError) errors.firstName = [fnError];
    if (lnError) errors.lastName = [lnError];
    if (emError) {
      errors.email = [emError];
    } else if (emailValidation.isEmailTaken) {
      errors.email = ["auth.signUp.errors.emailTaken"];
    }
    if (unError) {
      errors.username = [unError];
    } else if (usernameValidation.isUsernameTaken) {
      errors.username = ["auth.signUp.errors.usernameTaken"];
    }
    if (pwError) errors.password = [pwError];
    if (cpError) errors.confirmPassword = [cpError];
    if (termsError) errors.terms = [termsError];

    authStore.set("signUpRequestErrors", errors);

    const isValid =
      !fnError &&
      !lnError &&
      !emError &&
      !unError &&
      !pwError &&
      !cpError &&
      !termsError &&
      !usernameValidation.isCheckingUsername &&
      !emailValidation.isCheckingEmail &&
      !usernameValidation.isUsernameTaken &&
      !emailValidation.isEmailTaken;

    return isValid;
  };

  const step1Validation =
    !usernameValidation.isCheckingUsername &&
    !emailValidation.isCheckingEmail &&
    !usernameValidation.isUsernameTaken &&
    !emailValidation.isEmailTaken &&
    !validateFirstName(authStore.signUpRequest.firstName) &&
    !validateLastName(authStore.signUpRequest.lastName) &&
    !!authStore.signUpRequest.email &&
    !validateEmail(authStore.signUpRequest.email) &&
    !!authStore.signUpRequest.username &&
    !validateUsername(authStore.signUpRequest.username) &&
    !!authStore.signUpRequest.password &&
    !validatePassword(authStore.signUpRequest.password) &&
    authStore.signUpRequest.password === authStore.utilities.confirmPassword &&
    authStore.utilities.acceptedTerms;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <View className={cn("flex-1 px-2 bg-background", className)}>
          <Stepper
            classNames={{
              controlsWrapper: "pb-8",
            }}
            steps={[
              {
                title: t("auth.signUp.steps.identity.title"),
                description: t("auth.signUp.steps.identity.description"),
                component: (
                  <View key="step-0">
                    <FormBuilder structure={signUpFormStructure} />
                    <AcceptTerms
                      className="px-2 pt-2 pb-4"
                      checked={authStore.utilities.acceptedTerms}
                      onCheckedChange={(checked) => {
                        authStore.setNested("utilities.acceptedTerms", checked);
                        if (checked) {
                          authStore.setNested("signUpRequestErrors.terms", []);
                        }
                      }}
                      error={
                        authStore.signUpRequestErrors?.terms?.[0]
                          ? t(authStore.signUpRequestErrors.terms[0])
                          : undefined
                      }
                      required
                    />
                  </View>
                ),
                validation: step1Validation,
                onNext: () => validateStep1(),
              },
              {
                title: t("auth.signUp.steps.industries.title"),
                description: t("auth.signUp.steps.industries.description"),
                component: (
                  <FormBuilder
                    key="step-1"
                    structure={industriesFormStructure}
                  />
                ),
                validation: !!authStore.signUpRequest.industries.length,
              },
              {
                title: t("auth.signUp.steps.picture.title"),
                description: t("auth.signUp.steps.picture.description"),
                component: (
                  <FormBuilder
                    key="step-2"
                    structure={profilePictureFieldset}
                  />
                ),
                validation: !!authStore.signUpRequest.pictureId,
              },
            ]}
            closingActions={[
              {
                label: t("auth.signUp.actions.createAccount"),
                onPress: () => signUp(),
                disabled: isSignUpPending,
              },
            ]}
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
