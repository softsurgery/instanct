import { useState } from "react";
import { X, Cpu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils";

interface Objective {
  id: number;
  name: string;
}

interface ObjectivesSectionProps {
  allObjectives: Objective[];
  selectedObjectiveIds: number[];
  isLoading?: boolean;
  isMutationPending?: boolean;
  onSelectObjective: (id: number) => void;
  onRemoveObjective: (id: number) => void;
  onReset?: () => void;
  className?: string;
}

export function ObjectivesSection({
  allObjectives,
  selectedObjectiveIds,
  isLoading = false,
  isMutationPending = false,
  onSelectObjective,
  onRemoveObjective,
  onReset,
  className,
}: ObjectivesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected objective objects
  const selectedObjectives = selectedObjectiveIds
    .map((id) => allObjectives.find((objective) => objective.id === id))
    .filter(Boolean) as Objective[];

  // Filter available objectives
  const filteredObjectives = allObjectives.filter(
    (objective) =>
      objective.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedObjectiveIds.includes(objective.id),
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
          <h2 className="text-xl font-bold text-foreground">Objectives</h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search objectives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={isMutationPending}
        />
      </div>

      {/* Selected Objectives */}
      {selectedObjectives.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Selected Objectives ({selectedObjectives.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedObjectives.map((objective) => (
              <Badge
                key={objective.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                {objective.name}
                <button
                  onClick={() => onRemoveObjective(objective.id)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${objective.name}`}
                  disabled={isMutationPending}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Objectives */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Available Objectives
        </p>
        <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto rounded-lg border border-input bg-background p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredObjectives.length > 0 ? (
            filteredObjectives.map((objective) => (
              <Button
                key={objective.id}
                onClick={() => onSelectObjective(objective.id)}
                variant="outline"
                size="sm"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                disabled={isMutationPending}
              >
                {objective.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center py-6">
              {searchQuery
                ? "No objectives match your search"
                : allObjectives.length === 0
                  ? "No objectives available"
                  : "All objectives are selected"}
            </p>
          )}
        </div>
      </div>

      {/* Reset Button */}
      {onReset && (
        <Button
          className="w-full mb-15"
          onClick={onReset}
          variant="destructive"
          size="sm"
          disabled={selectedObjectiveIds.length === 0}
        >
          {isMutationPending ? "Resetting..." : "Reset"}
        </Button>
      )}
    </div>
  );
}
