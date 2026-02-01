import React from "react";
import { X, Search, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils";
import { SelectOption } from "./types";

interface SelectBoxProps {
  className?: string;
  params: SelectOption[];
  /** array of selected values */
  selected: Array<string | number>;
  isPending?: boolean;
  hasUnsavedChanges?: boolean;
  onSelectParam: (id: string | number) => void;
  onRemoveParam: (id: string | number) => void;
  onSave: () => void;
  onReset?: () => void;
  onCancel?: () => void;
}

export function SelectBox({
  params,
  selected,
  isPending = false,
  hasUnsavedChanges = false,
  onSelectParam,
  onRemoveParam,
  onSave,
  onReset,
  onCancel,
  className,
}: SelectBoxProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const selectedOptions = React.useMemo(
    () => params.filter((p) => selectedSet.has(p.value)),
    [params, selectedSet],
  );

  const filteredParams = React.useMemo(
    () =>
      params.filter(
        (param) =>
          param.label?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedSet.has(param.value),
      ),
    [params, searchQuery, selectedSet],
  );

  if (isPending) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6 mt-8", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search params..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={isPending}
        />
      </div>

      {/* Selected Params */}
      {selectedOptions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Selected Params ({selectedOptions.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((param) => (
              <Badge
                key={param.value}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                {param.label}
                <button
                  onClick={() => onRemoveParam(param.value)}
                  className="ml-1 hover:opacity-70 transition-opacity cursor-pointer"
                  aria-label={`Remove ${param.label}`}
                  disabled={isPending}
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Params */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Available Params</p>
        <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto rounded-lg border border-input bg-background p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredParams.length > 0 ? (
            filteredParams.map((param) => (
              <Badge
                key={param.value}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                <button
                  onClick={() => onSelectParam(param.value)}
                  className="ml-1 hover:opacity-70 transition-opacity cursor-pointer"
                  disabled={isPending}
                >
                  {param.label}
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center py-6">
              {searchQuery
                ? "No params match your search"
                : params.length === 0
                  ? "No params available"
                  : "All params are selected"}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mb-15 border-t pt-4">
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            className="flex-1"
            size="sm"
            disabled={!hasUnsavedChanges || isPending}
          >
            <Save className="h-4 w-4" />
            Save
            <Spinner show={isPending} className="ml-2" />
          </Button>

          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              disabled={!hasUnsavedChanges || isPending}
            >
              Cancel
            </Button>
          )}
        </div>

        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            disabled={selected.length === 0 || isPending}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
