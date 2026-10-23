import React from "react";
import { Pressable, View } from "react-native";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { StableKeyboardAwareScrollView } from "./StableKeyboardAwareScrollView";
import { useKeyboardVisible } from "./hooks/useKeyboardVisible";
import { cn } from "@softsurgery/lib";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

interface StepperProps {
  classNames?: {
    wrapper?: string;
    controlsWrapper?: string;
  };
  steps: {
    title?: string;
    description?: string;
    component: React.ReactNode;
    validation: boolean | (() => boolean);
    onNext?: () => boolean | void | Promise<boolean | void>;
    onNextAttempt?: () => void;
  }[];
  initialStep?: number;
  forwaredAdditionalActions?: Record<number, () => void>;
  backwordAdditionalActions?: Record<number, () => void>;
  closingActions?: {
    id?: string | number;
    label: string;
    className?: string;
    onPress: () => void;
    disabled?: boolean;
  }[];
  pending?: boolean;
  placeholders?: {
    nextLabel: string;
    previousLabel: string;
  };
}

export const Stepper = ({
  classNames,
  steps,
  initialStep = 0,
  forwaredAdditionalActions = {},
  backwordAdditionalActions = {},
  closingActions = [],
  pending = false,
  placeholders,
}: StepperProps) => {
  const { t } = useTranslation("common");
  const isKeyboardVisible = useKeyboardVisible();
  const [currentStep, setCurrentStep] = React.useState(initialStep);

  const runValidation = React.useCallback(
    (stepIndex: number) => {
      const validation = steps[stepIndex]?.validation;

      return typeof validation === "function" ? validation() : validation;
    },
    [steps],
  );

  const nextStep = async () => {
    const currentStepConfig = steps[currentStep];

    currentStepConfig?.onNextAttempt?.();

    if (currentStepConfig?.onNext) {
      const allowed = await currentStepConfig.onNext();
      if (allowed === false) return;
    }

    const isValid = runValidation(currentStep);

    // 🚫 block navigation if invalid
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);

      if (forwaredAdditionalActions[currentStep]) {
        forwaredAdditionalActions[currentStep]();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);

      if (backwordAdditionalActions[currentStep]) {
        backwordAdditionalActions[currentStep]();
      }
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <React.Fragment>
      {/* Step Content */}
      <StableKeyboardAwareScrollView className="flex-1">
        <View className="px-2 py-4">
          {steps[currentStep].title && (
            <Text className="text-lg font-semibold">
              {steps[currentStep].title}
            </Text>
          )}

          {steps[currentStep].description && (
            <Text className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </Text>
          )}
        </View>

        {steps[currentStep].component}
      </StableKeyboardAwareScrollView>

      {/* Controls */}
      {!isKeyboardVisible && (
        <View
          className={cn(
            "flex-row p-2 bg-muted border-t border-border",
            currentStep === 0 ? "justify-end" : "justify-between",
            classNames?.controlsWrapper,
          )}
        >
          {/* Previous */}
          <Pressable
            disabled={pending}
            onPress={prevStep}
            className={cn(
              "flex-row gap-2 px-3 py-1.5 rounded-xl active:opacity-70",
              pending && "opacity-50",
              currentStep === 0 ? "hidden" : "block",
            )}
          >
            <Icon as={ChevronLeft} size={20} />
            <Text className="text-base font-semibold">
              {placeholders?.previousLabel || t("actions.previous")}
            </Text>
          </Pressable>

          {/* Next / Finish */}

          {isLastStep && closingActions.length > 0 ? (
            <View className="flex-row gap-2">
              {closingActions.map((closingAction, index) => {
                const isActionDisabled =
                  closingAction.disabled ||
                  pending ||
                  runValidation(currentStep) === false;

                return (
                  <Pressable
                    key={closingAction.id ?? `closing-action-${index}`}
                    onPress={closingAction.onPress}
                    disabled={isActionDisabled}
                    className={cn(
                      "px-3 py-1.5 rounded-xl active:opacity-70",
                      isActionDisabled && "opacity-50",
                      closingAction.className,
                    )}
                  >
                    <Text className="text-base font-semibold">
                      {closingAction.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Pressable
              onPress={nextStep}
              className={cn(
                "flex-row gap-2 px-3 py-1.5 rounded-xl active:opacity-70",
                pending && "opacity-50",
              )}
              disabled={pending}
            >
              <Text className="text-base font-semibold">
                {placeholders?.nextLabel || t("actions.next")}
              </Text>
              <Icon as={ChevronRight} size={20} />
            </Pressable>
          )}
        </View>
      )}
    </React.Fragment>
  );
};
