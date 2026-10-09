import React from "react";
import { ViewInstance } from "react-native";

export type ScrollViewContextType = {
  scrollToView: (viewRef: React.RefObject<ViewInstance | null>) => void;
};

export const ScrollViewContext = React.createContext<ScrollViewContextType>({
  scrollToView: () => {},
});
