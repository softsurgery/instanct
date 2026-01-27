import { useState } from "react";
import { X, Cpu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils";

interface Industry {
  id: number;
  name: string;
}

interface IndustriesSectionProps {
  allIndustries: Industry[];
  selectedIndustryIds: number[];
  isLoading?: boolean;
  isMutationPending?: boolean;
  onSelectIndustry: (id: number) => void;
  onRemoveIndustry: (id: number) => void;
  onReset?: () => void;
  className?: string;
}

export function IndustriesSection({
  allIndustries,
  selectedIndustryIds,
  isLoading = false,
  isMutationPending = false,
  onSelectIndustry,
  onRemoveIndustry,
  onReset,
  className,
}: IndustriesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected industry objects
  const selectedIndustries = selectedIndustryIds
    .map((id) => allIndustries.find((industry) => industry.id === id))
    .filter(Boolean) as Industry[];

  // Filter available industries
  const filteredIndustries = allIndustries.filter(
    (industry) =>
      industry.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedIndustryIds.includes(industry.id),
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
          <h2 className="text-xl font-bold text-foreground">Industries</h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search industries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={isMutationPending}
        />
      </div>

      {/* Selected Industries */}
      {selectedIndustries.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Selected Industries ({selectedIndustries.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedIndustries.map((industry) => (
              <Badge
                key={industry.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                {industry.name}
                <button
                  onClick={() => onRemoveIndustry(industry.id)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${industry.name}`}
                  disabled={isMutationPending}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Industries */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Available Industries
        </p>
        <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto rounded-lg border border-input bg-background p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredIndustries.length > 0 ? (
            filteredIndustries.map((industry) => (
              <Button
                key={industry.id}
                onClick={() => onSelectIndustry(industry.id)}
                variant="outline"
                size="sm"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                disabled={isMutationPending}
              >
                {industry.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center py-6">
              {searchQuery
                ? "No industries match your search"
                : allIndustries.length === 0
                  ? "No industries available"
                  : "All industries are selected"}
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
          disabled={selectedIndustryIds.length === 0}
        >
          {isMutationPending ? "Resetting..." : "Reset"}
        </Button>
      )}
    </div>
  );
}
