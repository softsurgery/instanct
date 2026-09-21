import { cn } from "@instanct/lib";
import { StableSafeAreaView } from "@instanct/mobile-components";
import { ApplicationHeader } from "@instanct/mobile-components";
import { useTranslation } from "react-i18next";
import { StableKeyboardAwareScrollView } from "@instanct/mobile-components";

import { AppHeaderBack } from "@instanct/mobile-components";
interface VerifyEmailPortalProps {
  className?: string;
}

export const VerifyEmailPortal = ({ className }: VerifyEmailPortalProps) => {
  const { t } = useTranslation();
  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.verifyEmail", "Verify Email")}
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
        className="flex-1 bg-background"
      ></StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
