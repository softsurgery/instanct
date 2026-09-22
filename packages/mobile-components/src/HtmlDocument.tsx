import React from "react";
import { useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";
import { cn } from "@instanct/lib";
import {
  getHtmlDocumentClassesStyles,
  getHtmlDocumentTagsStyles,
} from "./html-document.styles";
import { useColorPalette } from "./hooks/useColorPalette";

export type HtmlDocumentProps = {
  html?: string;
  className?: string;
};

export function HtmlDocument({ html, className }: HtmlDocumentProps) {
  const { width } = useWindowDimensions();
  const source = React.useMemo(() => ({ html: html ?? "" }), [html]);
  const { palette } = useColorPalette();

  const tagsStyles = React.useMemo(() => getHtmlDocumentTagsStyles(palette), [palette]);
  const classesStyles = React.useMemo(() => getHtmlDocumentClassesStyles(palette), [palette]);

  return (
    <View className={cn(className)}>
      <RenderHtml
        contentWidth={width - 40}
        source={source}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
      />
    </View>
  );
}
