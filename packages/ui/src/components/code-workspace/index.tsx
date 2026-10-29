import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Text } from "../text";
import { Toolbar } from "../toolbar";
import { cn } from "../../lib/utils";

// Explicit JSX regions. The application owns tabs, resizing, files and execution state.
function Root({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace"
      className={cn(
        "astw:@container/workspace astw:flex astw:min-h-0 astw:min-w-0 astw:flex-1",
        className,
      )}
    />
  );
}
function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      {...props}
      data-slot="code-workspace-sidebar"
      className={cn(
        "astw:w-48 astw:shrink-0 astw:overflow-auto astw:border-r astw:border-border astw:bg-muted astw:p-4 astw:@max-[1150px]/workspace:w-40",
        className,
      )}
    />
  );
}
function Main({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace-main"
      className={cn(
        "astw:flex astw:min-h-0 astw:min-w-0 astw:flex-1 astw:@max-[1100px]/workspace:flex-col",
        className,
      )}
    />
  );
}
function Editor({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace-editor"
      className={cn(
        "astw:flex astw:min-h-0 astw:min-w-0 astw:flex-1 astw:flex-col astw:bg-background",
        className,
      )}
    />
  );
}
function EditorTabs({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="code-workspace-editor-tabs"
      className={cn(
        "astw:flex astw:shrink-0 astw:items-center astw:overflow-x-auto astw:border-b astw:border-border astw:bg-muted",
        className,
      )}
    />
  );
}
function Results({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      {...props}
      data-slot="code-workspace-results"
      className={cn(
        "astw:flex astw:min-h-32 astw:max-h-[48vh] astw:shrink-0 astw:flex-col",
        className,
      )}
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
      className={cn(
        "astw:flex astw:shrink-0 astw:items-center astw:gap-2 astw:overflow-x-auto astw:border-b astw:border-border astw:px-4 astw:py-2",
        className,
      )}
    >
      {children}
      {actions && (
        <div
          data-slot="code-workspace-results-actions"
          className="astw:ml-auto astw:flex astw:shrink-0 astw:items-center astw:gap-2"
        >
          {actions}
        </div>
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
      className={cn(
        "astw:min-h-0 astw:flex-1",
        graph
          ? "astw:flex astw:flex-col astw:overflow-hidden"
          : "astw:overflow-auto",
        className,
      )}
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
      className={cn(
        "astw:relative astw:flex astw:min-h-0 astw:w-(--code-workspace-panel-width) astw:max-w-[55%] astw:shrink-0 astw:flex-col astw:border-l astw:border-border astw:bg-muted astw:@max-[1100px]/workspace:h-64 astw:@max-[1100px]/workspace:w-full astw:@max-[1100px]/workspace:max-w-none astw:@max-[1100px]/workspace:border-t astw:@max-[1100px]/workspace:border-l-0",
        className,
      )}
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
}: ComponentProps<"div"> & {
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      {...props}
      data-slot="code-workspace-header"
      className={cn(
        "astw:flex astw:shrink-0 astw:items-center astw:gap-2 astw:border-b astw:border-border astw:p-4",
        className,
      )}
    >
      {icon}
      <Text
        variant="label-sm"
        className="astw:min-w-0 astw:flex-1"
        render={<span />}
      >
        {children}
      </Text>
      {actions && (
        <div
          data-slot="code-workspace-header-actions"
          className="astw:flex astw:items-center astw:gap-2"
        >
          {actions}
        </div>
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
      className={cn(
        "astw:flex astw:shrink-0 astw:flex-wrap astw:items-center astw:gap-3 astw:border-b astw:border-border astw:px-4 astw:py-2",
        className,
      )}
      {...props}
    >
      <div
        data-slot="code-workspace-title-group"
        className="astw:flex astw:min-w-0 astw:items-center astw:gap-2"
      >
        {title}
      </div>
      <div
        data-slot="code-workspace-page-actions"
        className="astw:flex astw:min-w-0 astw:flex-1 astw:flex-wrap astw:items-center astw:gap-3"
        ref={actionsRef}
      >
        {children}
      </div>
    </div>
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
    <div className="astw:shrink-0 astw:px-4 astw:py-2">
      <Toolbar.Row
        justify="between"
        {...props}
        data-slot="code-workspace-code-toolbar"
      >
        <Text
          variant="label-sm"
          className="astw:min-w-0 astw:flex-1"
          render={<span />}
        >
          {caption}
        </Text>
        {actions}
      </Toolbar.Row>
    </div>
  );
}
export const CodeWorkspace = {
  PageHeader,
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
