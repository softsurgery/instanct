import React from "react";
import { ResponseConfigurationParamDto } from "@/types";
import { Badge, cn } from "@softsurgery/ui";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  Hash,
  ToggleLeft,
  List,
  SlidersHorizontal,
  Copy,
  Check,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseArrayValue, formatArrayItem } from "./formatConfigParam";
import { toast } from "sonner";

export interface ParamTreeNode {
  id: string;
  segment: string;
  fullKey: string;
  param?: ResponseConfigurationParamDto;
  children: ParamTreeNode[];
  totalParamCount: number;
}

export function buildParamTree(
  params: ResponseConfigurationParamDto[] = [],
  namespaceName?: string,
): ParamTreeNode[] {
  const rootNodes: ParamTreeNode[] = [];
  const prefix = namespaceName ? `${namespaceName.toLowerCase()}.` : "";

  for (const param of params) {
    if (!param.name) continue;

    const rawName = param.name.trim();
    const effectiveName = rawName.toLowerCase().startsWith(prefix)
      ? rawName.slice(prefix.length)
      : rawName;

    const segments = effectiveName.split(".").filter(Boolean);
    if (!segments.length) continue;

    let currentLevel = rootNodes;
    let accumulatedPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      accumulatedPath = accumulatedPath
        ? `${accumulatedPath}.${segment}`
        : segment;
      const isLeaf = i === segments.length - 1;

      let existingNode = currentLevel.find((n) => n.segment === segment);

      if (!existingNode) {
        existingNode = {
          id: accumulatedPath,
          segment,
          fullKey: accumulatedPath,
          children: [],
          totalParamCount: 0,
        };
        currentLevel.push(existingNode);
      }

      if (isLeaf) {
        existingNode.param = param;
      }

      currentLevel = existingNode.children;
    }
  }

  // Recursively compute total number of parameters under each node
  const computeCount = (node: ParamTreeNode): number => {
    let count = node.param ? 1 : 0;
    for (const child of node.children) {
      count += computeCount(child);
    }
    node.totalParamCount = count;
    return count;
  };

  rootNodes.forEach(computeCount);
  return rootNodes;
}

function collectBranchIds(nodes: ParamTreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.children.length > 0) {
      ids.push(node.id);
      ids.push(...collectBranchIds(node.children));
    }
  }
  return ids;
}

interface ConfigurationParamTreeProps {
  params?: ResponseConfigurationParamDto[];
  namespaceName?: string;
  searchTerm?: string;
  className?: string;
}

export const ConfigurationParamTree: React.FC<ConfigurationParamTreeProps> = ({
  params = [],
  namespaceName,
  searchTerm,
  className,
}) => {
  const { t } = useTranslation("content-management");

  const tree = React.useMemo(
    () => buildParamTree(params, namespaceName),
    [params, namespaceName],
  );

  const allBranchIds = React.useMemo(() => collectBranchIds(tree), [tree]);

  // Expand all branches by default
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(
    () => new Set(allBranchIds),
  );

  // Keep all branches expanded when tree changes
  React.useEffect(() => {
    setExpandedKeys(new Set(allBranchIds));
  }, [allBranchIds]);

  // If search term is present, automatically expand branches that match
  React.useEffect(() => {
    if (!searchTerm?.trim()) return;
    const query = searchTerm.toLowerCase();

    const matchingBranchIds = new Set<string>();
    const checkMatch = (node: ParamTreeNode, parentBranchIds: string[]) => {
      const isMatch =
        node.segment.toLowerCase().includes(query) ||
        node.fullKey.toLowerCase().includes(query) ||
        (node.param?.value &&
          String(node.param.value).toLowerCase().includes(query));

      if (isMatch) {
        parentBranchIds.forEach((id) => matchingBranchIds.add(id));
      }

      const nextParents = [...parentBranchIds];
      if (node.children.length > 0) {
        nextParents.push(node.id);
      }

      for (const child of node.children) {
        checkMatch(child, nextParents);
      }
    };

    tree.forEach((node) => checkMatch(node, []));

    if (matchingBranchIds.size > 0) {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        matchingBranchIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchTerm, tree]);

  const toggleNode = React.useCallback((id: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const hasBranches = allBranchIds.length > 0;
  const allExpanded =
    hasBranches && allBranchIds.every((id) => expandedKeys.has(id));

  const toggleAll = React.useCallback(() => {
    if (allExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(allBranchIds));
    }
  }, [allBranchIds, allExpanded]);

  if (!params.length) {
    return (
      <span className="text-xs text-muted-foreground italic">
        {t("configuration.noParams", "No parameters")}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 py-1 font-mono text-xs max-w-xl",
        className,
      )}
    >
      {hasBranches && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 mb-0.5 select-none font-sans border-border/40 pb-1">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground/90">
              {params.length}
            </span>
            <span>
              {params.length === 1
                ? t("configuration.tree.param", "param")
                : t("configuration.tree.params", "params")}
            </span>
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors hover:underline"
          >
            {allExpanded ? (
              <>
                <ChevronsDownUp className="h-3 w-3" />
                <span>
                  {t("configuration.tree.collapseAll", "Collapse all")}
                </span>
              </>
            ) : (
              <>
                <ChevronsUpDown className="h-3 w-3" />
                <span>{t("configuration.tree.expandAll", "Expand all")}</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
        {tree.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            depth={0}
            expandedKeys={expandedKeys}
            toggleNode={toggleNode}
            searchTerm={searchTerm}
          />
        ))}
      </div>
    </div>
  );
};

interface TreeNodeItemProps {
  node: ParamTreeNode;
  depth: number;
  expandedKeys: Set<string>;
  toggleNode: (id: string) => void;
  searchTerm?: string;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  depth,
  expandedKeys,
  toggleNode,
  searchTerm,
}) => {
  const { t } = useTranslation("content-management");
  const [copied, setCopied] = React.useState(false);

  const hasChildren = node.children.length > 0;
  const isExpanded = expandedKeys.has(node.id);
  const param = node.param;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const copyText = param
      ? `${param.name || node.fullKey}: ${param.value ?? ""}`
      : node.fullKey;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    toast.success(t("configuration.tree.copied", "Copied to clipboard"));
    setTimeout(() => setCopied(false), 1500);
  };

  // Highlight matches
  const renderHighlighted = (text: string) => {
    if (!searchTerm?.trim()) return text;
    const term = searchTerm.toLowerCase();
    const lower = text.toLowerCase();
    const idx = lower.indexOf(term);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-amber-500/25 text-inherit rounded-xs px-0.5 font-semibold">
          {text.slice(idx, idx + term.length)}
        </mark>
        {text.slice(idx + term.length)}
      </>
    );
  };

  return (
    <div
      className={cn(
        "relative flex flex-col",
        depth > 0 &&
          "before:content-[''] before:absolute before:-left-3.75 before:top-2.75 before:w-2.5 before:h-px before:bg-border/60",
      )}
    >
      {hasChildren ? (
        // Branch Node Header
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleNode(node.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleNode(node.id);
            }
          }}
          className="flex items-center gap-1.5 py-0.5 px-1 -mx-1 rounded cursor-pointer hover:bg-muted/50 select-none transition-colors group leading-snug"
        >
          <span className="p-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform duration-150",
                isExpanded && "rotate-90",
              )}
            />
          </span>

          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 text-amber-500/90 dark:text-amber-400/90 shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-amber-500/70 dark:text-amber-400/70 shrink-0" />
          )}

          <span className="font-semibold text-foreground/90 font-mono text-xs tracking-tight">
            {renderHighlighted(node.segment)}
          </span>

          <span className="text-[10px] text-muted-foreground/70 bg-muted/70 px-1 py-0.2 rounded font-sans">
            ({node.totalParamCount})
          </span>

          {param && (
            <span className="ml-1 text-muted-foreground text-xs truncate max-w-xs">
              : {param.value || "—"}
            </span>
          )}
        </div>
      ) : (
        // Leaf Node
        <div
          className="relative flex items-start gap-1.5 py-0.5 px-1 -mx-1 rounded hover:bg-muted/40 transition-colors group leading-snug"
          title={`${param?.name || node.fullKey}: ${param?.value ?? ""}${
            param?.description ? ` (${param.description})` : ""
          }`}
        >
          <LeafIcon param={param} />

          <span className="font-medium text-foreground text-xs font-mono shrink-0 select-text">
            {renderHighlighted(node.segment)}:
          </span>

          <div className="flex-1 min-w-0 flex items-baseline gap-1">
            <ParamValueRenderer
              param={param}
              renderHighlighted={renderHighlighted}
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-all rounded hover:bg-muted shrink-0"
            title={t("configuration.tree.copyParam", "Copy parameter")}
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      )}

      {/* Children Container */}
      {hasChildren && isExpanded && (
        <div className="relative pl-3.5 ml-2 border-l border-border/60 flex flex-col gap-0.5 mt-0.5">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              toggleNode={toggleNode}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LeafIcon: React.FC<{ param?: ResponseConfigurationParamDto }> = ({
  param,
}) => {
  if (!param) {
    return (
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35 shrink-0 mt-1.5 ml-0.5 mr-0.5" />
    );
  }

  if (param.variant === "number") {
    return <Hash className="h-3 w-3 text-amber-500/80 shrink-0 mt-0.5" />;
  }

  if (param.variant === "boolean") {
    return (
      <ToggleLeft className="h-3 w-3 text-emerald-500/80 shrink-0 mt-0.5" />
    );
  }

  if (param.variant === "list" || parseArrayValue(param.value)) {
    return <List className="h-3 w-3 text-sky-500/80 shrink-0 mt-0.5" />;
  }

  if (param.variant === "select") {
    return (
      <SlidersHorizontal className="h-3 w-3 text-indigo-500/80 shrink-0 mt-0.5" />
    );
  }

  return (
    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35 shrink-0 mt-1.5 ml-0.5 mr-0.5" />
  );
};

interface ParamValueRendererProps {
  param?: ResponseConfigurationParamDto;
  renderHighlighted: (text: string) => React.ReactNode;
}

const ParamValueRenderer: React.FC<ParamValueRendererProps> = ({
  param,
  renderHighlighted,
}) => {
  if (!param) {
    return <span className="text-muted-foreground/60 italic text-xs">—</span>;
  }

  const rawValue = param.value;

  // Boolean
  if (
    param.variant === "boolean" ||
    rawValue === "true" ||
    rawValue === "false"
  ) {
    const isTrue = rawValue === "true";
    return (
      <Badge
        variant={isTrue ? "default" : "outline"}
        className="text-[10px] h-4 px-1.5 font-mono"
      >
        {isTrue ? "true" : "false"}
      </Badge>
    );
  }

  // Array / List
  const parsedArray = parseArrayValue(rawValue);
  if (parsedArray) {
    if (!parsedArray.length) {
      return (
        <span className="text-muted-foreground italic font-mono text-[11px]">
          (empty list)
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-0.5 w-full">
        <span className="text-[11px] text-muted-foreground font-mono">
          ({parsedArray.length} {parsedArray.length === 1 ? "item" : "items"})
        </span>
        <div className="relative pl-2.5 ml-1 border-l border-border/50 flex flex-col gap-0.5 mt-0.5 max-h-36 overflow-y-auto">
          {parsedArray.map((item, idx) => {
            const formatted = formatArrayItem(item);
            return (
              <div
                key={idx}
                className="flex items-baseline gap-1.5 text-xs font-mono text-muted-foreground truncate max-w-md"
                title={
                  typeof item === "object"
                    ? JSON.stringify(item, null, 2)
                    : String(item)
                }
              >
                <span className="text-muted-foreground/40 select-none text-[10px]">
                  •
                </span>
                <span className="truncate">{renderHighlighted(formatted)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Number badge / style
  if (param.variant === "number") {
    return (
      <span className="font-mono text-xs text-foreground bg-muted/40 px-1.5 py-0.2 rounded border border-border/40">
        {renderHighlighted(rawValue ?? "—")}
      </span>
    );
  }

  // Default string / select
  const displayVal = rawValue !== undefined && rawValue !== "" ? rawValue : "—";

  return (
    <span
      className="text-muted-foreground font-mono text-xs truncate max-w-sm select-text"
      title={displayVal}
    >
      {renderHighlighted(displayVal)}
    </span>
  );
};
