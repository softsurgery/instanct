import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from "@softsurgery/ui";
import { cn, formatFileSize } from "@softsurgery/lib";
import {
  Code2,
  Copy,
  Check,
  Eye,
  HardDrive,
  Monitor,
  RotateCcw,
  Smartphone,
  Tablet,
  ExternalLink,
  Sparkles,
  FileCode,
} from "lucide-react";
import { TemplateVisualizerProps } from "../../types";

type ViewportMode = "desktop" | "tablet" | "mobile";

export const TemplateVisualizer = ({
  className,
  content,
  title,
}: TemplateVisualizerProps) => {
  const { t } = useTranslation("content-management");
  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");
  const [reloadKey, setReloadKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"preview" | "source">(
    "preview",
  );

  // Calculate actual UTF-8 byte size (size in octets)
  const byteSize = React.useMemo(() => {
    if (!content) return 0;
    return new TextEncoder().encode(content).length;
  }, [content]);

  const lineCount = React.useMemo(() => {
    if (!content) return 0;
    return content.split("\n").length;
  }, [content]);

  const charCount = content ? content.length : 0;

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleOpenExternal = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col flex-1 h-full min-h-[500px] bg-background border rounded-xl shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10 text-primary">
            <Eye className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">
            {t("templates.visualizer.title", "Visualizer")}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-medium px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("templates.visualizer.liveBadge", "Live Preview")}
          </Badge>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-1.5">
          {activeTab === "preview" && (
            <div className="flex items-center bg-background border rounded-lg p-0.5 shadow-xs">
              <Button
                variant={viewport === "desktop" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setViewport("desktop")}
                title={t("templates.visualizer.desktop", "Desktop")}
              >
                <Monitor className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">100%</span>
              </Button>
              <Button
                variant={viewport === "tablet" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setViewport("tablet")}
                title={t("templates.visualizer.tablet", "Tablet (768px)")}
              >
                <Tablet className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">768px</span>
              </Button>
              <Button
                variant={viewport === "mobile" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setViewport("mobile")}
                title={t("templates.visualizer.mobile", "Mobile (375px)")}
              >
                <Smartphone className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">375px</span>
              </Button>
            </div>
          )}

          {activeTab === "preview" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setReloadKey((k) => k + 1)}
              title={t("templates.visualizer.reload", "Reload Preview")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}

          {activeTab === "preview" && content && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleOpenExternal}
              title={t("templates.visualizer.openNewTab", "Open in New Tab")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}

          {activeTab === "source" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={handleCopy}
              disabled={!content}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-emerald-500" />
                  {t("templates.visualizer.copied", "Copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher Bar */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "preview" | "source")}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="px-4 py-2 border-b bg-muted/20">
          <TabsList className="grid grid-cols-2 max-w-[280px] h-8">
            <TabsTrigger
              value="preview"
              className="text-xs flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("templates.visualizer.rendered", "Rendered View")}
            </TabsTrigger>
            <TabsTrigger
              value="source"
              className="text-xs flex items-center gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5" />
              {t("templates.visualizer.source", "Source Code")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Live Rendered Iframe */}
        <TabsContent
          value="preview"
          className="flex-1 overflow-auto p-4 m-0 bg-muted/10 flex flex-col items-center justify-start"
        >
          {content ? (
            <div
              className={cn(
                "w-full transition-all duration-200 flex-1 flex flex-col items-center",
                getViewportWidthClass(),
              )}
            >
              <div className="w-full flex-1 min-h-[450px] bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
                <iframe
                  key={reloadKey}
                  title={title || "Template Visualizer"}
                  srcDoc={content}
                  className="w-full flex-1 min-h-[450px] border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-16 text-center max-w-sm">
              <div className="p-3.5 rounded-full bg-primary/10 text-primary mb-3">
                <FileCode className="h-8 w-8" />
              </div>
              <h4 className="font-semibold text-base mb-1">
                {t("templates.visualizer.emptyTitle", "No Content to Preview")}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "templates.visualizer.emptyDesc",
                  "Start typing HTML or template code on the left to see the live rendering here.",
                )}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Raw Source View */}
        <TabsContent
          value="source"
          className="flex-1 overflow-auto p-4 m-0 bg-zinc-950 text-zinc-100"
        >
          <pre className="font-mono text-xs whitespace-pre-wrap break-all leading-relaxed selection:bg-primary selection:text-primary-foreground">
            {content || "// Empty template content"}
          </pre>
        </TabsContent>
      </Tabs>

      {/* Footer Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <HardDrive className="h-3.5 w-3.5 text-primary" />
            <span>{t("templates.visualizer.size", "Size")}:</span>
            <span className="font-mono text-foreground font-semibold">
              {formatFileSize(byteSize)}
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-foreground">{charCount}</span>
            <span>{t("templates.visualizer.chars", "chars")}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-foreground">{lineCount}</span>
            <span>{t("templates.visualizer.lines", "lines")}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>HTML &amp; EJS Sandbox</span>
        </div>
      </div>
    </div>
  );
};
