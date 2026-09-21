import { FormHeaderText } from "../types.js";

export const formHeaderValue = (header?: FormHeaderText): string | undefined => {
  if (header == null) return undefined;
  return typeof header === "string" ? header : header.value;
};

export const formHeaderClassName = (
  header?: FormHeaderText,
): string | undefined => {
  return typeof header === "string" ? undefined : header?.className;
};
