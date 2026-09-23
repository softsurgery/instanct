import { Button } from "@instanct/mobile-ui";
import { Icon } from "@instanct/mobile-ui";
import { Text } from "@instanct/mobile-ui";
import { toLongDateString } from "@instanct/mobile-components";
import { ScrollViewContext } from "@instanct/mobile-components";
import { cn } from "@instanct/lib";
import { Calendar, ChevronDown } from "lucide-react-native";
import React from "react";
import { Keyboard, Platform, Pressable, UIManager, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { StableScrollable } from "@instanct/mobile-components";
import { Separator } from "@instanct/mobile-ui";
import { triggerHaptic } from "@instanct/mobile-components";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MONTHS = [
  { label: "January", value: "jan" },
  { label: "February", value: "feb" },
  { label: "March", value: "mar" },
  { label: "April", value: "apr" },
  { label: "May", value: "may" },
  { label: "June", value: "jun" },
  { label: "July", value: "jul" },
  { label: "August", value: "aug" },
  { label: "September", value: "sep" },
  { label: "October", value: "oct" },
  { label: "November", value: "nov" },
  { label: "December", value: "dec" },
];

interface DatePickerProps {
  className?: string;
  classNames?: {
    trigger: string;
    content: string;
  };
  value?: Date | null;
  onDateChange: (date: Date | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}

export const DatePicker = ({
  className,
  classNames,
  disabled,
  value: date = null,
  onDateChange,
  nullable = true,
}: DatePickerProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const rotation = useSharedValue(0);
  const { scrollToView } = React.useContext(ScrollViewContext);
  const contentRef = React.useRef<View>(null);

  const toggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
    if (!date) onDateChange(new Date());
    if (next) {
      setTimeout(() => {
        scrollToView(contentRef);
      }, 100);
    }
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const displayText = React.useMemo(
    () => (date ? toLongDateString(date) : "Select a date"),
    [date],
  );

  const [year, setYear] = React.useState(
    date ? String(date.getFullYear()) : "2023",
  );
  const [month, setMonth] = React.useState(
    date ? MONTHS[date.getMonth()].value : "jan",
  );
  const [day, setDay] = React.useState(date ? String(date.getDate()) : "1");

  // Sync local state when controlled date changes externally
  const dateTime = date ? date.getTime() : null;
  React.useEffect(() => {
    if (date) {
      setYear(String(date.getFullYear()));
      setMonth(MONTHS[date.getMonth()].value);
      setDay(String(date.getDate()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTime]);

  const years = Array.from({ length: 50 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: String(y) };
  }).reverse();

  const days = Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    return { label: String(d), value: String(d) };
  }).filter(
    (d) =>
      Number(d.value) <=
      new Date(
        Number(year),
        MONTHS.findIndex((m) => m.value === month) + 1,
        0,
      ).getDate(),
  );

  const handleDateChange = (key: "day" | "month" | "year", value: string) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;

    switch (key) {
      case "day":
        newDay = value;
        break;
      case "month":
        newMonth = value;
        break;
      case "year":
        newYear = value;
        break;
    }

    setYear(newYear);
    setMonth(newMonth);
    setDay(newDay);

    if (onDateChange) {
      const newDate = new Date(
        Number(newYear),
        MONTHS.findIndex((m) => m.value === newMonth),
        Number(newDay),
      );
      onDateChange(newDate);
    }
  };

  const clearDate = () => {
    onDateChange(null);
  };

  return (
    <Animated.View
      layout={LinearTransition}
      className={cn("w-full", className)}
    >
      {/* Trigger */}
      <Button
        disabled={disabled}
        variant="outline"
        className={cn("w-full h-11 rounded-xl p-0 px-2", classNames?.trigger)}
        onPress={toggle}
      >
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex flex-row items-center gap-2">
            <Icon as={Calendar} size={16} color={"gray"} />
            <Text className={cn("text-base", !date && "text-foreground/50")}>
              {displayText}
            </Text>
          </View>
          <Animated.View style={chevronStyle}>
            <Icon as={ChevronDown} size={16} color={"gray"} />
          </Animated.View>
        </View>
      </Button>

      {/* Accordion content */}
      {expanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          ref={contentRef}
          className={cn(
            "mt-2 rounded-xl border border-border bg-card p-3",
            classNames?.content,
          )}
          // Prevent parent ScrollView from stealing touches while interacting with the wheels
        >
          <View 
            className="flex-row items-center justify-center gap-4"
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <StableScrollable
              options={days}
              value={day}
              onChange={(opt) => handleDateChange("day", opt.value)}
              className="flex-1 h-12 bg-card rounded-lg"
            />
            <StableScrollable
              options={MONTHS}
              value={month}
              onChange={(opt) => handleDateChange("month", opt.value)}
              className="flex-1 h-12 bg-card rounded-lg"
            />
            <StableScrollable
              options={years}
              value={year}
              onChange={(opt) => handleDateChange("year", opt.value)}
              className="flex-1 h-12 bg-card rounded-lg"
            />
          </View>
          <Separator className="my-2" />
          <View className="flex-row justify-between">
            <Pressable
              className="p-2 rounded-lg"
              onPress={() => {
                triggerHaptic();
                setExpanded(false);
                clearDate();
              }}
            >
              <Text className="font-bold">Remove Date</Text>
            </Pressable>
            <Pressable
              className="p-2 rounded-lg"
              onPress={() => {
                triggerHaptic();
                setExpanded(false);
              }}
            >
              <Text className="text-primary font-bold">Done</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
