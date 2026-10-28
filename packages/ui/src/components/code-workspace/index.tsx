import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils";

// Explicit JSX regions. The application owns tabs, resizing, files and execution state.
function Root({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace"
      className={cn("erpui-code-workspace", className)}
    />
  );
}
function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      {...props}
      data-slot="code-workspace-sidebar"
      className={cn("erpui-code-workspace-sidebar", className)}
    />
  );
}
function Main({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace-main"
      className={cn("erpui-code-workspace-main", className)}
    />
  );
}
function Editor({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace-editor"
      className={cn("erpui-code-workspace-editor", className)}
    />
  );
}
function EditorTabs({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace-editor-tabs"
      className={cn("erpui-code-workspace-editor-tabs", className)}
    />
  );
}
function Results({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      {...props}
      data-slot="code-workspace-results"
      className={cn("erpui-code-workspace-results", className)}
    />
  );
}
function ResultsHeader({
  className,
  actions,
  children,
  ...props
}: ComponentProps<"div"> & { actions?: ReactNode }) {
  return (
    <div
      {...props}
      data-slot="code-workspace-results-header"
      className={cn("erpui-code-workspace-results-header", className)}
    >
      {children}
      {actions && (
        <div data-slot="code-workspace-results-actions">{actions}</div>
      )}
    </div>
  );
}

function ResultsBody({
  className,
  graph = false,
  ...props
}: ComponentProps<"div"> & { graph?: boolean }) {
  return (
    <div
      {...props}
      data-slot="code-workspace-results-body"
      data-graph={graph || undefined}
      className={cn("erpui-code-workspace-results-body", className)}
    />
  );
}
function Panel({
  className,
  width = 420,
  style,
  ...props
}: ComponentProps<"aside"> & { width?: number }) {
  return (
    <aside
      {...props}
      data-slot="code-workspace-panel"
      className={cn("erpui-code-workspace-panel", className)}
      style={
        {
          "--code-workspace-panel-width": `${width}px`,
          ...style,
        } as CSSProperties
      }
    />
  );
}
function Header({
  className,
  icon,
  actions,
  children,
  ...props
}: ComponentProps<"div"> & { icon?: ReactNode; actions?: ReactNode }) {
  return (
    <div
      {...props}
      data-slot="code-workspace-header"
      className={cn("erpui-code-workspace-header", className)}
    >
      {icon}
      <span>{children}</span>
      {actions && (
        <div data-slot="code-workspace-header-actions">{actions}</div>
      )}
    </div>
  );
}
export const CodeWorkspace = {
  Root,
  Sidebar,
  Main,
  Editor,
  EditorTabs,
  Results,
  ResultsHeader,
  ResultsBody,
  Panel,
  Header,
};
