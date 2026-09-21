import React from "react";
import { createPortal } from "react-dom";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Maximize, Minimize } from "lucide-react";
import { RichTextEditor, Link, cn } from "@instanct/ui";
import { EditorFieldProps, Field } from "../types";

interface RichTextFieldProps {
  field: Field<EditorFieldProps>;
}

export const RichTextField = ({ field }: RichTextFieldProps) => {
  const { value, onChange, disabled, maxLength, height, autoHeight } =
    field.props || {};
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Link,
      Placeholder.configure({
        placeholder: field.placeholder || "Type here...",
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      onChangeRef.current?.(instance.getHTML());
    },
  });

  React.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  React.useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  React.useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const content = (
    <div
      className={cn(
        "w-full rounded-md shadow-sm mt-1 transition-all duration-200",
        field.error && "border-destructive focus-within:ring-destructive",
        isFullscreen &&
          "fixed inset-0 z-[9999]  m-0 p-1 sm:p-3 w-full h-full overflow-hidden flex flex-col rounded-none border-none",
        !isFullscreen && field.className,
      )}
    >
      <RichTextEditor
        editor={editor}
        editable={!disabled}
        className={cn(
          isFullscreen && "h-full min-h-0 flex flex-col flex-1 overflow-hidden",
        )}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.CodeBlock />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
            <RichTextEditor.AlignJustify />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <div className="flex-1" />
          <RichTextEditor.ControlsGroup>
            <button
              type="button"
              className="rte-control-button text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content
          className={cn(
            "overflow-y-auto",
            !height && !autoHeight && !isFullscreen && "min-h-37.5 max-h-100",
            autoHeight && !isFullscreen && "min-h-37.5",
            isFullscreen && "flex-1 min-h-0 max-h-none",
          )}
          style={
            !isFullscreen && height ? { height, minHeight: height } : undefined
          }
        />
      </RichTextEditor>
    </div>
  );

  if (isFullscreen && typeof document !== "undefined") {
    return (
      <>
        <div
          className={cn("w-full rounded-md mt-1", field.className)}
          style={{ height: height || "150px" }}
        />
        {createPortal(content, document.body)}
      </>
    );
  }

  return content;
};
