import React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@instanct/ui";
import { Download, MoreHorizontal, Upload } from "lucide-react";

type ImportExportActionsProps = {
  exportLabel: string;
  importLabel: string;
  disabled?: boolean;
  onExport: () => void;
  onImport: (file: File) => void | Promise<void>;
};

export function ImportExportActions({
  exportLabel,
  importLabel,
  disabled,
  onExport,
  onImport,
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
    <>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            disabled={disabled}
          >
            <MoreHorizontal className="size-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleImportClick} disabled={disabled}>
            <Upload />
            {importLabel}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExport} disabled={disabled}>
            <Download />
            {exportLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
