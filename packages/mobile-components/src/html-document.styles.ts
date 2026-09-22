import type { MixedStyleRecord } from "react-native-render-html";
import { hslToHex } from "./lib/theme";

export const getHtmlDocumentTagsStyles = (palette: any): MixedStyleRecord => ({
  body: {
    color: hslToHex(palette.foreground),
    fontSize: 15,
    lineHeight: 24,
  },
  h1: {
    color: hslToHex(palette.foreground),
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 24,
    marginBottom: 12,
  },
  h2: {
    color: hslToHex(palette.foreground),
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 22,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: hslToHex(palette.border),
  },
  h3: {
    color: hslToHex(palette.foreground),
    fontSize: 17,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
  },
  h4: {
    color: hslToHex(palette.foreground),
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  p: {
    color: hslToHex(palette.foreground),
    fontSize: 15,
    lineHeight: 24,
    marginTop: 0,
    marginBottom: 12,
  },
  ul: {
    marginTop: 4,
    marginBottom: 14,
    paddingLeft: 18,
  },
  ol: {
    marginTop: 4,
    marginBottom: 14,
    paddingLeft: 18,
  },
  li: {
    color: hslToHex(palette.foreground),
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 6,
  },
  strong: {
    color: hslToHex(palette.foreground),
    fontWeight: "700",
  },
  em: {
    color: hslToHex(palette.foreground),
    fontStyle: "italic",
  },
  a: {
    color: hslToHex(palette.primary),
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  mark: {
    backgroundColor: hslToHex(palette.primary, 0.25),
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  blockquote: {
    backgroundColor: hslToHex(palette.card),
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 12,
    fontStyle: "normal",
  },
  code: {
    color: hslToHex(palette.foreground),
    fontSize: 13,
    backgroundColor: hslToHex(palette.muted, 0.5),
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  hr: {
    marginVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: hslToHex(palette.border),
  },
});

export const getHtmlDocumentClassesStyles = (palette: any): MixedStyleRecord => ({
  "legal-not-applied": {
    backgroundColor: hslToHex(palette.card),
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
});
