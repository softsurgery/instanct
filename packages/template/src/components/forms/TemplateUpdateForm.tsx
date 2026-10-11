import React from "react";
import { cn } from "@instanct/lib";
import { Button } from "@instanct/ui";
import { Save } from "lucide-react";
import { FormBuilder } from "@instanct/form-builder";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useUpdateTemplateFormStructure } from "./useUpdateTemplateFormStructure";
import { useTranslation } from "react-i18next";

interface TemplateUpdateFormProps {
  className?: string;
  templateCallback?: () => void;
  cancelCallback?: () => void;
  isPending?: boolean;
}

export const TemplateUpdateForm = ({
  className,
  templateCallback,
  cancelCallback,
  isPending,
}: TemplateUpdateFormProps) => {
  const { t } = useTranslation("content-management");
  const templateStore = useTemplateStore();

  const { templateUpdateFormStructure } = useUpdateTemplateFormStructure({
    templateStore,
  });

  return (
    <div
      className={cn("flex flex-col flex-1 overflow-hidden gap-2", className)}
    >
      <FormBuilder
        className="mx-auto px-2 h-full flex flex-col flex-1 overflow-auto w-full"
        structure={templateUpdateFormStructure}
      />
      <div className="flex gap-2 justify-end px-4 py-3 border-t">
        <Button
          onClick={() => {
            templateCallback?.();
          }}
          disabled={isPending}
        >
          <Save className="mr-1 h-4 w-4" />
          {t("templates.actions.save", "Save")}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => {
            cancelCallback?.();
          }}
          disabled={isPending}
        >
          {t("templates.actions.cancel", "Cancel")}
        </Button>
      </div>
    </div>
  );
};
