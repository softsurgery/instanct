import { cn } from "@softsurgery/lib";
import { View } from "react-native";
import { InspectBaseProfile } from "../profile/BaseProfile";
import {
  AppHeaderBack,
  ApplicationHeader,
  StableSafeAreaView,
} from "@softsurgery/mobile-components";

interface InspectProfileProps {
  className?: string;
  id: string;
}

export const InspectProfile = ({ className, id }: InspectProfileProps) => {
  return (
    <View className={cn("flex-1", className)}>
      <InspectBaseProfile
        id={id}
        coverExtra={
          <StableSafeAreaView
            className="absolute top-0 left-0 right-0 z-30"
            pointerEvents="box-none"
          >
            <ApplicationHeader
              title=""
              reverse
              shortcuts={[
                {
                  key: "back",
                  render: <AppHeaderBack />,
                },
              ]}
            />
          </StableSafeAreaView>
        }
      />
    </View>
  );
};
