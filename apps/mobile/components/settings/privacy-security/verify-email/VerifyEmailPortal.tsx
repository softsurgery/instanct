import { cn } from "@softsurgery/lib";
import {
  StableSafeAreaView,
  ApplicationHeader,
  StableKeyboardAwareScrollView,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";
import { useLayoutConfig } from "@/config/wrapper-config";

interface VerifyEmailPortalProps {
  className?: string;
}

export const VerifyEmailPortal = ({ className }: VerifyEmailPortalProps) => {
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
  const { t } = useTranslation(["common", "screens"]);
  return (
    <StableSafeAreaView
      classNames={safeAreaClassNames}
      className={cn(className)}
    >
      <ApplicationHeader
        classNames={{
          wrapper: applicationHeaderClassNames.wrapper,
        }}
        title={t("screens.verifyEmail")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableKeyboardAwareScrollView
        contentContainerClassName="px-4 py-4"
        className="flex-1 bg-background rounded-b-xl"
      ></StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
