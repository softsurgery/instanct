import { ScrollViewContext } from "./contexts/ScrollViewContext";
import { cn } from "@instanct/lib";

import React, { forwardRef, type ReactNode, useCallback, useRef } from "react";

import {
  Dimensions,
  type StyleProp,
  type ViewStyle,
  type ViewInstance,
} from "react-native";

import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from "@react-native-ohos/react-native-keyboard-aware-scroll-view";

import { cssInterop } from "nativewind";

cssInterop(KeyboardAwareScrollView, {
  className: "style",
});

/**
 * NativeWind adds className at runtime, but the third-party
 * component's TypeScript declarations do not include it.
 */
type NativeWindKeyboardAwareScrollViewProps = KeyboardAwareScrollViewProps & {
  className?: string;
};

const NativeWindKeyboardAwareScrollView =
  KeyboardAwareScrollView as React.ComponentType<
    NativeWindKeyboardAwareScrollViewProps &
      React.RefAttributes<React.ComponentRef<typeof KeyboardAwareScrollView>>
  >;

type KeyboardAwareScrollViewRef = React.ComponentRef<
  typeof KeyboardAwareScrollView
>;

type KeyboardAwareScrollHandler = NonNullable<
  KeyboardAwareScrollViewProps["onScroll"]
>;

type StableKeyboardAwareScrollViewProps = Omit<
  KeyboardAwareScrollViewProps,
  "style" | "contentContainerStyle"
> & {
  className?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const StableKeyboardAwareScrollView = forwardRef<
  KeyboardAwareScrollViewRef,
  StableKeyboardAwareScrollViewProps
>(function StableKeyboardAwareScrollView(props, forwardedRef) {
  const {
    className,
    children,
    style,
    contentContainerStyle,
    showsHorizontalScrollIndicator = false,
    showsVerticalScrollIndicator = false,
    bounces = true,
    onScroll,
    ...rest
  } = props;

  const innerRef = useRef<KeyboardAwareScrollViewRef>(null);
  const scrollOffsetRef = useRef(0);

  const setRef = useCallback(
    (node: KeyboardAwareScrollViewRef | null) => {
      innerRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (
          forwardedRef as React.MutableRefObject<KeyboardAwareScrollViewRef | null>
        ).current = node;
      }
    },
    [forwardedRef],
  );

  const handleScroll = useCallback<KeyboardAwareScrollHandler>(
    (event) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
      onScroll?.(event);
    },
    [onScroll],
  );

  const scrollToView = useCallback(
    (viewRef: React.RefObject<ViewInstance | null>) => {
      const target = viewRef.current;

      if (!target || !innerRef.current) {
        return;
      }

      target.measureInWindow((_x, y, _width, height) => {
        const screenHeight = Dimensions.get("window").height;
        const bottomOfTarget = y + height;

        if (bottomOfTarget > screenHeight - 40) {
          const extra = bottomOfTarget - screenHeight + 150;

          innerRef.current?.scrollToPosition(
            0,
            scrollOffsetRef.current + extra,
            true,
          );
        }
      });
    },
    [],
  );

  const contextValue = React.useMemo(() => ({ scrollToView }), [scrollToView]);

  return (
    <ScrollViewContext.Provider value={contextValue}>
      <NativeWindKeyboardAwareScrollView
        {...rest}
        ref={setRef}
        className={cn(className)}
        style={
          (style ?? []) as NonNullable<KeyboardAwareScrollViewProps["style"]>
        }
        contentContainerStyle={
          (contentContainerStyle ?? []) as NonNullable<
            KeyboardAwareScrollViewProps["contentContainerStyle"]
          >
        }
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        bounces={bounces}
        enableOnAndroid
        onScroll={handleScroll}
        scrollEventThrottle={16}
        enableResetScrollToCoords={false}
      >
        {children}
      </NativeWindKeyboardAwareScrollView>
    </ScrollViewContext.Provider>
  );
});

StableKeyboardAwareScrollView.displayName = "StableKeyboardAwareScrollView";
