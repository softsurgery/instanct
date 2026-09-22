import { Icon } from "@instanct/mobile-ui";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { StablePressable } from "./StablePressable";

interface TappableProps {
  className?: string;
  classNames?: {
    content?: string;
    pressable?: string;
  };
  children?: ReactNode;
  onPress?: () => void;
}

export const Tappable = ({
  className,
  classNames = {
    content: "text-muted-foreground",
    pressable: "bg-primary/25",
  },
  children,
  onPress,
}: TappableProps) => {
  return (
    <StablePressable
      className={cn(
        "flex flex-row items-center justify-between py-4 px-2",
        className,
      )}
      onPress={onPress}
      onPressClassname={classNames?.pressable}
    >
      <Text className={cn("text-sm", classNames?.content)}>{children}</Text>
      <Icon as={ChevronRight} size={20} color={"gray"} />
    </StablePressable>
  );
};
