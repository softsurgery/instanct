import { cn, prepareLegalMarkdown } from "@instanct/lib";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export type MarkdownDocumentProps = {
  markdown: string;
  className?: string;
  notAppliedLabel?: string;
};

const pendingMarkClassName =
  "rounded-sm bg-amber-200/80 px-1 text-amber-950 dark:bg-amber-500/30 dark:text-amber-50";

function createComponents(notAppliedLabel: string): Components {
  return {
    h1: ({ children }) => (
      <h1 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-4 leading-7 text-muted-foreground first:mt-0">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4"
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b bg-muted/50 text-foreground">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-medium">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 align-top text-muted-foreground">{children}</td>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    mark: ({ className, children }) => (
      <mark className={cn(className === "legal-pending" && pendingMarkClassName)}>
        {children}
      </mark>
    ),
    div: ({ className, children, ...props }) => {
      if (className === "legal-not-applied") {
        return (
          <aside className="my-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-100">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              {notAppliedLabel}
            </p>
            <div className="space-y-2">{children}</div>
          </aside>
        );
      }

      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    },
  };
}

export function MarkdownDocument({
  markdown,
  className,
  notAppliedLabel = "Not currently applied",
}: MarkdownDocumentProps) {
  const content = prepareLegalMarkdown(markdown);

  return (
    <div className={cn("legal-markdown", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={createComponents(notAppliedLabel)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
