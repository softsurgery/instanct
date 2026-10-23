import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Label,
  Textarea,
  Badge,
} from "@softsurgery/ui";
import { cn } from "@softsurgery/lib";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Code,
  Tag,
  AlertCircle,
} from "lucide-react";
import { TemplateEditorProps } from "../../types";
import { TemplateVisualizer } from "../visualizer/TemplateVisualizer";

const QUICK_TAGS = [
  "{{name}}",
  "{{email}}",
  "{{company}}",
  "{{year}}",
  "<h1>Title</h1>",
  "<p>Paragraph</p>",
  "<a href=\"#\">Link</a>",
  "<button style=\"padding:10px 20px;\">CTA</button>",
];

export const TemplateEditor = ({
  className,
  mode,
  templateId,
  initialName = "",
  initialContent = "",
  isPending = false,
  onSave,
  onCancel,
  title,
  description,
}: TemplateEditorProps) => {
  const { t } = useTranslation("content-management");

  const [name, setName] = React.useState(initialName);
  const [content, setContent] = React.useState(initialContent);
  const [showVisualizer, setShowVisualizer] = React.useState(true);
  const [nameError, setNameError] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Keep state in sync if initial values change
  React.useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  React.useEffect(() => {
    if (initialContent) setContent(initialContent);
  }, [initialContent]);

  const handleInsertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = content.substring(0, start) + tag + content.substring(end);
    setContent(nextContent);

    // Reposition cursor right after inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enable 2-space tab indenting inside the code editor
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = "  ";
      const nextContent = content.substring(0, start) + indent + content.substring(end);
      setContent(nextContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t("templates.fields.nameRequired", "Template name is required."));
      return;
    }
    setNameError(null);
    onSave({ name: name.trim(), content });
  };

  return (
    <div
      className={cn(
        "flex flex-col flex-1 h-full min-h-0 overflow-hidden gap-3 p-4",
        className,
      )}
    >
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("templates.editor.backToTemplates", "Back to Templates")}</span>
          </Button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <Badge variant={mode === "create" ? "default" : "secondary"} className="text-[10px]">
                {mode === "create" ? t("templates.singularName", "Template") : "Edit"}
              </Badge>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Visualizer Toggle */}
          <Button
            type="button"
            variant={showVisualizer ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowVisualizer((prev) => !prev)}
            className="h-9 gap-1.5 text-xs font-medium"
            title={
              showVisualizer
                ? t("templates.visualizer.hide", "Hide Visualizer")
                : t("templates.visualizer.show", "Show Visualizer")
            }
          >
            {showVisualizer ? (
              <EyeOff className="h-4 w-4 text-primary" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span>
              {showVisualizer
                ? t("templates.visualizer.hide", "Hide Visualizer")
                : t("templates.visualizer.show", "Show Visualizer")}
            </span>
          </Button>

          {/* Cancel */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="h-9 text-xs"
          >
            {t("templates.actions.cancel", "Cancel")}
          </Button>

          {/* Save */}
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="h-9 gap-1.5 text-xs font-medium shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>
              {isPending
                ? t("templates.editor.saving", "Saving...")
                : t("templates.editor.save", "Save Template")}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Work Area: Side-by-Side Grid */}
      <div
        className={cn(
          "grid gap-4 flex-1 h-full min-h-0 overflow-hidden",
          showVisualizer
            ? "grid-cols-1 xl:grid-cols-2"
            : "grid-cols-1 max-w-4xl mx-auto w-full",
        )}
      >
        {/* Left Column: Form & Code Editor */}
        <div className="flex flex-col flex-1 h-full min-h-0 bg-card border rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Code className="h-4 w-4 text-primary" />
              <span>{t("templates.fields.content", "HTML / Template Content")}</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              EJS &amp; HTML supported
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-auto p-4 gap-4">
            {/* Template Name Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="template-name" className="text-xs font-medium">
                  {t("templates.fields.name", "Template Name")}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {t("templates.fields.nameDescription", "Unique template identifier.")}
                </span>
              </div>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. welcome-email"
                className={cn(
                  "h-9 font-mono text-xs",
                  nameError && "border-destructive focus-visible:ring-destructive",
                )}
              />
              {nameError && (
                <div className="flex items-center gap-1 text-[11px] text-destructive mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Quick Insert Helpers */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{t("templates.editor.quickInsert", "Quick Insert:")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-md border bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* HTML / EJS Textarea Editor */}
            <div className="flex flex-col flex-1 min-h-[350px] space-y-1.5">
              <Label htmlFor="template-content" className="text-xs font-medium">
                {t("templates.fields.content", "HTML / Template Content")}
              </Label>
              <Textarea
                ref={textareaRef}
                id="template-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t(
                  "templates.editor.contentPlaceholder",
                  "<!DOCTYPE html>\n<html>\n  <body>...</body>\n</html>",
                )}
                className="flex-1 min-h-[350px] font-mono text-xs leading-relaxed resize-none bg-background p-3.5 focus-visible:ring-1"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Toggleable Visualizer */}
        {showVisualizer && (
          <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden animate-in fade-in-50 duration-200">
            <TemplateVisualizer content={content} title={name} />
          </div>
        )}
      </div>
    </div>
  );
};
