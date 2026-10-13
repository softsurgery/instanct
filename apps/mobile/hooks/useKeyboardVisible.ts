import React from "react";
import { Keyboard } from "react-native";

export const useKeyboardVisible = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(
    Keyboard.isVisible(),
  );

  React.useEffect(() => {
    const subscriptions = [
      Keyboard.addListener("keyboardWillShow", () => {
        setIsKeyboardVisible(true);
      }),
      Keyboard.addListener("keyboardDidShow", () => {
        setIsKeyboardVisible(true);
      }),
      Keyboard.addListener("keyboardWillHide", () => {
        setIsKeyboardVisible(false);
      }),
      Keyboard.addListener("keyboardDidHide", () => {
        setIsKeyboardVisible(false);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  return isKeyboardVisible;
};
