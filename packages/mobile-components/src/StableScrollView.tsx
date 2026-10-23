import React from "react";
import {
  ScrollView,
  Text,
  type ScrollViewProps,
  type ScrollView as ScrollViewInstance,
} from "react-native";

interface StableScrollViewProps extends ScrollViewProps {
  className?: string;
  children?: React.ReactNode;
}

type NativeWindScrollViewProps = ScrollViewProps & {
  className?: string;
};

const NativeWindScrollView = ScrollView as React.ComponentType<
  NativeWindScrollViewProps & React.RefAttributes<ScrollViewInstance>
>;

const wrapChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (child == null) return null;

    // Wrap plain text and numbers in Text.
    if (typeof child === "string" || typeof child === "number") {
      return <Text>{child}</Text>;
    }

    // Recursively process fragments.
    if (React.isValidElement(child) && child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;

      return <>{wrapChildren(fragment.props.children)}</>;
    }

    // Recursively process children of other React elements.
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;

      if (element.props.children != null) {
        return React.cloneElement(element, {
          children: wrapChildren(element.props.children),
        });
      }

      return element;
    }

    return child;
  });
};

const StableScrollView = React.forwardRef<
  ScrollViewInstance,
  StableScrollViewProps
>(function StableScrollView(
  { className, children, style, bounces = false, refreshControl, ...props },
  ref,
) {
  return (
    <NativeWindScrollView
      {...props}
      ref={ref}
      className={className}
      bounces={refreshControl ? true : bounces}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={refreshControl ? true : false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      overScrollMode={refreshControl ? "always" : "never"}
      keyboardShouldPersistTaps="handled"
      style={style}
      refreshControl={refreshControl}
      contentContainerStyle={[{ flexGrow: 1 }, props.contentContainerStyle]}
    >
      {wrapChildren(children)}
    </NativeWindScrollView>
  );
});

StableScrollView.displayName = "StableScrollView";

export default StableScrollView;
export { StableScrollView };
