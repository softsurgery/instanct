import React from "react";
import { useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";
import { cn } from "@instanct/lib";
import {
  htmlDocumentClassesStyles,
  htmlDocumentTagsStyles,
} from "./html-document.styles";

export type HtmlDocumentProps = {
  html?: string;
  className?: string;
};

export function HtmlDocument({ html, className }: HtmlDocumentProps) {
  const { width } = useWindowDimensions();
  const source = React.useMemo(() => ({ html: html ?? "" }), [html]);

  return (
    <View className={cn(className)}>
      <RenderHtml
        contentWidth={width - 40}
        source={source}
        tagsStyles={htmlDocumentTagsStyles}
        classesStyles={htmlDocumentClassesStyles}
      />
    </View>
  );
}
