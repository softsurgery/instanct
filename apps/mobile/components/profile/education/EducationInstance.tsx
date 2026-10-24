import { SeeMoreText } from "@softsurgery/mobile-components";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { ResponseEducationDto } from "@softsurgery/api-client";
import { GraduationCap } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface EducationInstanceProps {
  className?: string;
  education: ResponseEducationDto;
  editable?: boolean;
  onEdit?: () => void;
}

export const EducationInstance = ({
  className,
  education,
  editable,
  onEdit,
}: EducationInstanceProps) => {
  return (
    <Pressable
      disabled={!editable || !onEdit}
      onPress={onEdit}
      className={cn(
        "flex-row gap-3 items-start rounded-xl",
        editable && "active:opacity-70",
        className,
      )}
    >
      {/* School tile */}
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/50">
        <Icon as={GraduationCap} size={20} color={"white"} />
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {education.title}
        </Text>
        {!!education.institution && (
          <Text className="mt-0.5 text-sm font-semibold text-muted-foreground">
            {education.institution}
          </Text>
        )}

        {!!education.description && (
          <SeeMoreText
            className="mt-2.5"
            textClassname="text-sm leading-5 text-muted-foreground"
            numberOfLines={2}
          >
            {education.description}
          </SeeMoreText>
        )}
      </View>
    </Pressable>
  );
};
