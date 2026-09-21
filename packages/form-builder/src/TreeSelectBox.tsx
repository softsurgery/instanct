"use client";

import React from "react";
import { Search, Save, X } from "lucide-react";
import { Input } from "@instanct/ui/components/input";
import { Button } from "@instanct/ui/components/button";
import { Badge } from "@instanct/ui/components/badge";
import { cn } from "@instanct/lib";
import { Loader2 } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

interface TreeSelectBoxProps {
  className?: string;
  params: Option[];
  selected: Array<string | number>;
  isPending?: boolean;
  hasUnsavedChanges?: boolean;
  onSelectParam: (id: string | number) => void;
  onRemoveParam: (id: string | number) => void;
  onSave: () => void;
  onReset?: () => void;
  onCancel?: () => void;
}

// ---------- pure helpers ----------
const leafNodes = (
  items: Option[],
  path = "",
): Array<{ value: string | number; label: string; fullPath: string }> =>
  items.flatMap((item) => {
    const cur = path ? `${path} > ${item.label}` : item.label;
    return !item.children?.length
      ? [{ value: item.value, label: item.label, fullPath: cur }]
      : leafNodes(item.children, cur);
  });

// remove siblings of the clicked node (exclusive sibling expansion)
const removeSiblings = (
  items: Option[],
  val: string | number,
): Set<string | number> => {
  const set = new Set<string | number>();
  const walk = (opts: Option[], parent?: Option) => {
    for (const opt of opts) {
      if (opt.value === val && parent?.children) {
        parent.children.forEach((c) => set.add(c.value));
        return true;
      }
      if (opt.children && walk(opt.children, opt)) return true;
    }
    return false;
  };
  walk(items);
  return set;
};

// -------------------------------------------------

export function TreeSelectBox({
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
}: TreeSelectBoxProps) {
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string | number>>(
    new Set(),
  );

  // label lookup – O(n) once, then O(1) per badge
  const labelMap = React.useMemo(() => {
    const map = new Map<string | number, string>();
    const walk = (opts: Option[]) => {
      opts.forEach((opt) => {
        map.set(opt.value, opt.label);
        if (opt.children) walk(opt.children);
      });
    };
    walk(params);
    return map;
  }, [params]);

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const leaves = React.useMemo(() => leafNodes(params), [params]);
  const filtered = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return leaves.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.fullPath.toLowerCase().includes(q),
    );
  }, [leaves, query]);

  // toggle – only one sibling per level can be open
  const toggle = (val: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (prev.has(val)) {
        // collapse – remove this node and all its descendants
        const kill = (opts: Option[]) => {
          opts.forEach((i) => {
            next.delete(i.value);
            if (i.children) kill(i.children);
          });
        };
        const findNode = (opts: Option[]): Option | undefined => {
          for (const i of opts) {
            if (i.value === val) return i;
            if (i.children) {
              const f = findNode(i.children);
              if (f) return f;
            }
          }
        };
        const n = findNode(params);
        if (n) kill([n]);
      } else {
        // expand – remove all siblings of the clicked node
        removeSiblings(params, val).forEach((v) => next.delete(v));
        next.add(val);
      }
      return next;
    });
  };

  const renderTree = (items: Option[], depth = 0): React.ReactNode =>
    items.map((item) => {
      const hasKids = !!item.children?.length;
      const isExp = expanded.has(item.value);
      const isSel = selectedSet.has(item.value);
      return (
        <React.Fragment key={item.value}>
          <button
            onClick={() =>
              hasKids
                ? toggle(item.value)
                : isSel
                  ? onRemoveParam(item.value)
                  : onSelectParam(item.value)
            }
            className={cn(
              "px-3 py-2 rounded-md font-medium transition-all duration-200",
              depth > 0 && "ml-6",
              hasKids
                ? [
                    `bg-muted/${depth === 0 ? "40" : "30"} text-muted-foreground hover:bg-muted/70`,
                    isExp &&
                      `bg-muted/70 border-l-4 border-l-${depth === 0 ? "primary" : "muted-foreground"}/50`,
                  ]
                : isSel
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : `bg-${depth === 0 ? "secondary" : "accent"}/80 text-secondary-foreground hover:bg-secondary/70`,
              !isPending && "cursor-pointer active:scale-[0.98]",
              isPending && "opacity-50 cursor-not-allowed",
            )}
            disabled={isPending}
          >
            {item.label}
          </button>
          {item.children && isExp && (
            <div className="flex flex-wrap gap-2 mt-2">
              {renderTree(item.children, depth + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });

  const renderSearch = () =>
    filtered.length ? (
      filtered.map((n, i) => {
        const isSel = selectedSet.has(n.value);
        return (
          <div
            key={n.value}
            className="w-full animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <button
              onClick={() =>
                isSel ? onRemoveParam(n.value) : onSelectParam(n.value)
              }
              className={cn(
                "px-3 py-2 rounded-md font-medium text-left transition-all w-full",
                isSel
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                !isPending && "cursor-pointer active:scale-[0.99]",
                isPending && "opacity-50 cursor-not-allowed",
              )}
              disabled={isPending}
            >
              <div className="flex items-center gap-2">
                <span>{n.label}</span>
                {n.fullPath !== n.label && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {n.fullPath}
                  </Badge>
                )}
              </div>
            </button>
          </div>
        );
      })
    ) : (
      <p className="text-sm text-muted-foreground w-full text-center py-6">
        No results found for &quot;{query}&quot;
      </p>
    );

  return (
    <div className={cn("w-full space-y-6 mt-8", className)}>
      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parameters..."
          className="pl-9 transition-all "
          disabled={isPending}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all hover:scale-110"
            disabled={isPending}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* selected badges – no animations, no delays, no flicker */}
      {selected.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            Selected Parameters{" "}
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
              {selected.length}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const label = labelMap.get(id);
              if (!label) return null;
              return (
                <Badge
                  key={id}
                  variant="default"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  {label}
                  <button
                    onClick={() => onRemoveParam(id)}
                    className="ml-1 hover:opacity-70 transition-opacity"
                    disabled={isPending}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* tree / search results */}
      <div className="space-y-3">
        <p className="text-sm font-medium">
          Available Parameters {query && `(Search: "${query}")`}
        </p>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-input bg-background p-4 flex flex-wrap gap-2 [&::-webkit-scrollbar]:hidden">
          {query ? renderSearch() : renderTree(params)}
        </div>
      </div>

      {/* actions */}
      <div className="flex flex-col gap-3 border-t pt-4">
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            className="flex-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="sm"
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              disabled={!hasUnsavedChanges || isPending}
              className="transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </Button>
          )}
        </div>
        {onReset && (
          <Button
            onClick={onReset}
            variant="destructive"
            size="sm"
            disabled={selected.length === 0 || isPending}
            className="transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
