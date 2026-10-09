import { Text, TextClassContext } from "./text";
import { cn } from "@instanct/lib";
import { View, type ViewProps, type TextProps } from "react-native";

type CardProps = ViewProps & { className?: string };
type CardTextProps = TextProps & { className?: string };

function Card({ className, ...props }: CardProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          "bg-card border-border flex flex-col gap-6 rounded-xl border py-6 shadow-sm shadow-black/5",
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return (
    <View className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: CardTextProps) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: CardTextProps) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: CardProps) {
  return <View className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <View
      className={cn("flex flex-row items-center px-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
