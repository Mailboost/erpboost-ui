import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Button, type ButtonProps } from "../button";
import { Input, type InputProps } from "../input";
import { Toolbar } from "../toolbar";
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
  variant = "default",
  ...props
}: ComponentProps<"div"> & {
  icon?: ReactNode;
  actions?: ReactNode;
  variant?: "default" | "folder";
}) {
  return (
    <div
      {...props}
      data-slot="code-workspace-header"
      data-variant={variant}
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
/** Page heading and action portal host. State, renaming and action handlers stay outside. */
function PageHeader({
  title,
  actionsRef,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  actionsRef?: ComponentProps<"div">["ref"];
}) {
  return (
    <div
      data-slot="code-workspace-page-header"
      className={cn("erpui-code-page-header", className)}
      {...props}
    >
      <div data-slot="code-workspace-title-group">{title}</div>
      <div data-slot="code-workspace-page-actions" ref={actionsRef}>
        {children}
      </div>
    </div>
  );
}
function TitleTrigger({ className, ...props }: ButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      {...props}
      className={cn("erpui-code-title-trigger", className)}
    />
  );
}
function TitleInput({
  value,
  placeholder,
  ...props
}: Omit<InputProps, "value" | "type"> & { value: string }) {
  return (
    <h2 data-slot="code-workspace-title-input" data-name={value || placeholder}>
      <Input {...props} value={value} placeholder={placeholder} />
    </h2>
  );
}
function CodeToolbar({
  caption,
  actions,
  ...props
}: Omit<ComponentProps<typeof Toolbar.Row>, "children"> & {
  caption: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Toolbar.Row {...props} data-slot="code-workspace-code-toolbar">
      <span>{caption}</span>
      {actions}
    </Toolbar.Row>
  );
}
export const CodeWorkspace = {
  PageHeader,
  TitleTrigger,
  TitleInput,
  CodeToolbar,
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
