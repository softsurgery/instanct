import { EditorContent } from "@tiptap/react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorContentProps } from "./types";
import { cn } from "./ui/utils";

export const Content = ({
  children,
  className,
  style,
}: RichTextEditorContentProps) => {
  const { editor } = useRichTextEditorContext();

  return (
    <div className={cn("rte-content relative min-h-0", className)} style={style}>
      <EditorContent editor={editor} className="w-full" />
      {children}
    </div>
  );
};
