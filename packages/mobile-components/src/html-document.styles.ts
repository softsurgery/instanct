import type { MixedStyleRecord } from "react-native-render-html";

export const htmlDocumentTagsStyles: MixedStyleRecord = {
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
  h1: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 24,
    marginBottom: 12,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 22,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120, 120, 128, 0.22)",
  },
  h3: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  p: {
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
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 6,
  },
  strong: {
    fontWeight: "700",
  },
  em: {
    fontStyle: "italic",
  },
  a: {
    color: "#2563eb",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  mark: {
    backgroundColor: "rgba(245, 158, 11, 0.35)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  blockquote: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderLeftWidth: 4,
    borderLeftColor: "#d97706",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 12,
    fontStyle: "normal",
  },
  code: {
    fontSize: 13,
    backgroundColor: "rgba(120, 120, 128, 0.12)",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  hr: {
    marginVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120, 120, 128, 0.22)",
  },
};

export const htmlDocumentClassesStyles: MixedStyleRecord = {
  "legal-not-applied": {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderLeftWidth: 4,
    borderLeftColor: "#d97706",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
};
