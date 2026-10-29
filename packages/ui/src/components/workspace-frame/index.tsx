import type { ComponentProps, CSSProperties } from "react";
import "./style.css";
/** Layout only: routing, authentication, navigation and overlay hosts stay with the consumer. */
function Root({
  className = "",
  sidebarWidth = 176,
  compactSidebarWidth = 72,
  style,
  ...props
}: ComponentProps<"div"> & {
  sidebarWidth?: number;
  compactSidebarWidth?: number;
}) {
  return (
    <div
      {...props}
      data-slot="workspace-frame"
      className={`erpui-workspace-frame ${className}`}
      style={
        {
          "--erpui-sidebar-width": `${sidebarWidth}px`,
          "--erpui-compact-sidebar-width": `${compactSidebarWidth}px`,
          ...style,
        } as CSSProperties
      }
    />
  );
}
function Header({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-header"
      className={`erpui-workspace-header ${className}`}
    />
  );
}
function Sidebar({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-sidebar"
      className={`erpui-workspace-sidebar ${className}`}
    />
  );
}
function Workspace({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-workspace"
      className={`erpui-workspace-region ${className}`}
    />
  );
}
function ScrollArea({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-scroll"
      className={`erpui-workspace-scroll ${className}`}
    />
  );
}
function Content({
  className = "",
  mode = "page",
  ...props
}: ComponentProps<"main"> & { mode?: "page" | "fill" | "flush" }) {
  return (
    <main
      {...props}
      data-slot="workspace-frame-content"
      data-mode={mode}
      className={`erpui-workspace-content ${className}`}
    />
  );
}
export const WorkspaceFrame = {
  Root,
  Header,
  Sidebar,
  Workspace,
  ScrollArea,
  Content,
};
