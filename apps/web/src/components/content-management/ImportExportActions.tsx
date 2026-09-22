import React from "react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@instanct/ui";
import { Download, Upload } from "lucide-react";

type ImportExportActionsProps = {
  exportLabel: string;
  importLabel: string;
  disabled?: boolean;
  onExport: () => void;
  onImport: (file: File) => void | Promise<void>;
  children?: React.ReactNode;
};

function IconAction({
  label,
  disabled,
  onClick,
  icon,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
          >
            {icon}
            <span className="sr-only">{label}</span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function ImportExportActions({
  exportLabel,
  importLabel,
  disabled,
  onExport,
  onImport,
  children,
}: ImportExportActionsProps) {
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = React.useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFile = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      await onImport(file);
    },
    [onImport],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />
      <div className="flex items-center gap-2">
        {children}
        <div className="flex items-center gap-1">
          <IconAction
            label={exportLabel}
            disabled={disabled}
            onClick={onExport}
            icon={<Download />}
          />
          <IconAction
            label={importLabel}
            disabled={disabled}
            onClick={handleImportClick}
            icon={<Upload />}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
