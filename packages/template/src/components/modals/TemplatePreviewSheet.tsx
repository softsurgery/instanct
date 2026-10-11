import React from "react";
import { useSheet } from "@instanct/components";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@instanct/ui";
import { useTranslation } from "react-i18next";
import { Code2, Eye, HardDrive } from "lucide-react";
import { DataTableCell, DataTableCellVariant } from "@instanct/datatable-builder";
import { ResponseTemplateDto } from "../../types";

export interface TemplatePreviewSheetProps {
  template?: ResponseTemplateDto | null;
  resetTemplate?: () => void;
}

export const useTemplatePreviewSheet = ({
  template,
  resetTemplate,
}: TemplatePreviewSheetProps) => {
  const { t } = useTranslation("content-management");

  const {
    SheetFragment: previewTemplateSheet,
    openSheet: openPreviewTemplateSheet,
    closeSheet: closePreviewTemplateSheet,
  } = useSheet({
    title: (
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <span>
          {t("templates.sheet.preview.title", "Preview Template")}:{" "}
          <span className="font-semibold">{template?.name}</span>
        </span>
      </div>
    ),
    description: t(
      "templates.sheet.preview.description",
      "Inspect the rendered HTML preview or view the raw source content.",
    ),
    children: (
      <div className="flex flex-col flex-1 overflow-hidden px-4 gap-4 mt-2">
        <Tabs defaultValue="preview" className="flex flex-col flex-1 overflow-hidden w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t("templates.dialogs.preview.renderedTab", "Rendered Preview")}
            </TabsTrigger>
            <TabsTrigger value="source" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              {t("templates.dialogs.preview.sourceTab", "Source Code")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-3">
            <div className="border rounded-md bg-white p-4 h-full min-h-125 overflow-auto">
              {template?.content ? (
                <iframe
                  title={template.name || "Template Preview"}
                  srcDoc={template.content}
                  className="w-full h-full min-h-120 border-0"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="text-muted-foreground text-center py-10">
                  {t("templates.dialogs.preview.empty", "No content available")}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="source" className="flex-1 overflow-hidden mt-3">
            <pre className="border rounded-md bg-muted/60 p-4 h-full min-h-125 overflow-auto font-mono text-xs whitespace-pre-wrap break-all select-all">
              {template?.content || "// Empty template"}
            </pre>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between items-center pt-3 pb-2 border-t mt-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" />
            <span>{t("templates.columns.size", "Size")}:</span>
            <DataTableCell
              variant={DataTableCellVariant.FILE_SIZE}
              value={template?.size}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              closePreviewTemplateSheet();
              resetTemplate?.();
            }}
          >
            {t("templates.actions.close", "Close")}
          </Button>
        </div>
      </div>
    ),
    className: "min-w-[50vw] flex flex-col flex-1 overflow-hidden",
    onToggle: resetTemplate,
  });

  return {
    previewTemplateSheet,
    openPreviewTemplateSheet,
    closePreviewTemplateSheet,
  };
};
