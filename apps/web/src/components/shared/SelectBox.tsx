import { useState } from "react";
import { X, Cpu, Search, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils";

interface Param {
  id: number;
  name: string;
}

interface SelectBoxProps {
  allParams: Param[];
  selectedParamIds: number[];
  isLoading?: boolean;
  isMutationPending?: boolean;
  hasUnsavedChanges?: boolean;
  onSelectParam: (id: number) => void;
  onRemoveParam: (id: number) => void;
  onSave: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function SelectBox({
  allParams,
  selectedParamIds,
  isLoading = false,
  isMutationPending = false,
  hasUnsavedChanges = false,
  onSelectParam,
  onRemoveParam,
  onSave,
  onReset,
  onCancel,
  className,
}: SelectBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedParams = selectedParamIds
    .map((id) => allParams.find((param) => param.id === id))
    .filter(Boolean) as Param[];

  const filteredParams = allParams.filter(
    (param) =>
      param.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedParamIds.includes(param.id),
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6 mt-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <h2 className="text-xl font-bold text-foreground">Params</h2>
        </div>
        {hasUnsavedChanges && (
          <span className="text-xs font-medium text-red-600  px-2 py-1 rounded">
            Unsaved
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search params..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={isMutationPending}
        />
      </div>

      {/* Selected Params */}
      {selectedParams.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Selected Params ({selectedParams.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedParams.map((param) => (
              <Badge
                key={param.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                {param.name}
                <button
                  onClick={() => onRemoveParam(param.id)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${param.name}`}
                  disabled={isMutationPending}
                >
                  <X size={14} />
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
              <Button
                key={param.id}
                onClick={() => onSelectParam(param.id)}
                variant="outline"
                size="sm"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                disabled={isMutationPending}
              >
                {param.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center py-6">
              {searchQuery
                ? "No params match your search"
                : allParams.length === 0
                  ? "No params available"
                  : "All params are selected"}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-15 border-t pt-4">
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            className="flex-1"
            size="sm"
            disabled={!hasUnsavedChanges || isMutationPending}
          >
            <Save className="h-4 w-4 " />
            Save
            <Spinner show={isMutationPending} className="ml-2" />
          </Button>

          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            disabled={!hasUnsavedChanges || isMutationPending}
          >
            Cancel
          </Button>
        </div>

        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            disabled={selectedParamIds.length === 0 || isMutationPending}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
