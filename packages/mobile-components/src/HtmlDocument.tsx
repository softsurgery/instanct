import React from "react";
import { useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";
import { cn } from "@instanct/lib";

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
        tagsStyles={{
          body: {
            fontSize: 14,
            lineHeight: 22,
          },
          p: {
            marginTop: 0,
            marginBottom: 12,
          },
          h1: {
            fontSize: 22,
            fontWeight: "600",
            marginTop: 16,
            marginBottom: 8,
          },
          h2: {
            fontSize: 18,
            fontWeight: "600",
            marginTop: 14,
            marginBottom: 6,
          },
          h3: {
            fontSize: 16,
            fontWeight: "600",
            marginTop: 12,
            marginBottom: 4,
          },
          mark: {
            backgroundColor: "rgba(251, 191, 36, 0.4)",
          },
          a: {
            color: "#2563eb",
            textDecorationLine: "underline",
          },
          ul: {
            marginTop: 4,
            marginBottom: 12,
          },
          ol: {
            marginTop: 4,
            marginBottom: 12,
          },
        }}
        classesStyles={{
          "legal-not-applied": {
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            borderColor: "rgba(245, 158, 11, 0.4)",
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            marginVertical: 8,
          },
        }}
      />
    </View>
  );
}
