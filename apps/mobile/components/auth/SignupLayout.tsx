import { cn } from "@softsurgery/lib";
import { router } from "expo-router";
import { View } from "react-native";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { useSignUpFormStructure } from "./useSignupFormStructure";
import { AcceptTerms } from "./AcceptTerms";
import {
  StableSafeAreaView,
  ApplicationHeader,
  Stepper,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import { useSignupDebugButton } from "./useSignupDebugButton";
import React from "react";
import { useApi, useIndustries, useUploadMutation } from "api-client/hooks";
import { useAuthStore, useAuthValidation } from "api-client/hooks/auth";
import { ServerErrorResponse, Upload } from "api-client";
import { toast } from "sonner-native";
import { useMutation } from "@tanstack/react-query";
import { useLayoutConfig } from "@/config/wrapper-config";
import { useTranslation } from "react-i18next";
import { useLoader } from "@/contexts/LoaderContext";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";
import {
  validateConfirmPassword,
  validateEmail,
  validateFirstName,
  validateIndustries,
  validateLastName,
  validatePassword,
  validateUsername,
} from "api-client/hooks/auth/useAuthValidation";

interface SignupLayoutProps {
  className?: string;
}

export const SignupLayout = ({ className }: SignupLayoutProps) => {
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
  const { isLandscape } = useScreenOrientation();
  const api = useApi();
  const { t } = useTranslation("auth");
  const authStore = useAuthStore();
  const { industries } = useIndustries();
  const { DebugButton } = useSignupDebugButton({ store: authStore });
  const { setLoading } = useLoader();
  const [isPickingPicture, setIsPickingPicture] = React.useState(false);

  const {
    uploadFiles: uploadProfilePicture,
    isUploadPending: isProfilePictureUploadPending,
  } = useUploadMutation({
    onProgress: (progress: number) => {
      authStore.setNested("utilities.progress", progress);
    },
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
    onPickStart: () => setIsPickingPicture(true),
    onPickEnd: () => setIsPickingPicture(false),
  });

  React.useEffect(() => {
    setLoading(isProfilePictureUploadPending || isPickingPicture);
  }, [isProfilePictureUploadPending, isPickingPicture, setLoading]);

  React.useEffect(() => {
    return () => {
      setLoading(false);
      authStore.reset();
    };
  }, [setLoading]);

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
      if (router.canDismiss()) {
        router.dismissTo("/auth/sign-in");
      } else {
        router.replace("/auth/sign-in");
      }
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

  const validateStep2 = () => {
    const error = validateIndustries(authStore.signUpRequest.industries);
    if (error) {
      authStore.setNested("signUpRequestErrors.industries", [error]);
      return false;
    }
    authStore.setNested("signUpRequestErrors.industries", []);
    return true;
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
    <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
      <ApplicationHeader
        classNames={{
          wrapper: applicationHeaderClassNames.wrapper,
        }}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background rounded-b-xl">
        <View className={cn("flex-1 px-2 bg-background", className)}>
          <Stepper
            classNames={{
              controlsWrapper: isLandscape ? "pb-2" : "pb-8",
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
                    <DebugButton />
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
                onNext: () => validateStep2(),
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
