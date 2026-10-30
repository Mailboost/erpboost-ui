import { cn } from "@/lib/utils";
import type { ComponentProps, CSSProperties } from "react";
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
      className={cn(
        "erpui-workspace-frame astw:grid astw:grid-cols-[var(--erpui-sidebar-width)_minmax(0,1fr)]",
        "astw:grid-rows-[auto_minmax(0,1fr)] astw:flex-1 astw:min-w-0 astw:min-h-0 astw:overflow-hidden",
        "astw:bg-card astw:text-foreground",
        "astw:[@media(max-width:700px)]:grid-cols-[var(--erpui-compact-sidebar-width)_minmax(0,1fr)]",
        className,
      )}
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
      className={cn(
        "erpui-workspace-header astw:[.erpui-workspace-frame>&]:col-span-full",
        "astw:[.erpui-workspace-frame>&]:row-start-1 astw:[.erpui-workspace-frame>&]:min-w-0",
        "astw:[.erpui-workspace-frame>&]:z-10",
        className,
      )}
    />
  );
}
function Sidebar({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-sidebar"
      className={cn(
        "erpui-workspace-sidebar astw:[.erpui-workspace-frame>&]:col-start-1",
        "astw:[.erpui-workspace-frame>&]:row-start-2 astw:[.erpui-workspace-frame>&]:flex",
        "astw:[.erpui-workspace-frame>&]:flex-col astw:[.erpui-workspace-frame>&]:min-w-0",
        "astw:[.erpui-workspace-frame>&]:min-h-0 astw:[.erpui-workspace-frame>&]:overflow-hidden",
        "astw:[&>*]:flex-1 astw:[&>*]:min-h-0",
        className,
      )}
    />
  );
}
function Workspace({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-workspace"
      className={cn(
        "erpui-workspace-region astw:[.erpui-workspace-frame>&]:col-start-2",
        "astw:[.erpui-workspace-frame>&]:row-start-2 astw:[.erpui-workspace-frame>&]:flex",
        "astw:[.erpui-workspace-frame>&]:flex-col astw:[.erpui-workspace-frame>&]:min-w-0",
        "astw:[.erpui-workspace-frame>&]:min-h-0",
        className,
      )}
    />
  );
}
function ScrollArea({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="workspace-frame-scroll"
      className={cn(
        "erpui-workspace-scroll astw:[.erpui-workspace-region>&]:min-w-0",
        "astw:[.erpui-workspace-region>&]:min-h-0 astw:[.erpui-workspace-region>&]:flex-1",
        "astw:[.erpui-workspace-region>&]:overflow-auto",
        className,
      )}
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
      className={cn(
        "erpui-workspace-content astw:[.erpui-workspace-scroll>&]:w-full",
        "astw:[.erpui-workspace-scroll>&]:max-w-320 astw:[.erpui-workspace-scroll>&]:my-0",
        "astw:[.erpui-workspace-scroll>&]:mx-auto astw:[.erpui-workspace-scroll>&]:pt-8",
        "astw:[.erpui-workspace-scroll>&]:px-8 astw:[.erpui-workspace-scroll>&]:pb-6",
        "astw:[.erpui-workspace-scroll>&[data-mode=fill]]:h-full",
        "astw:[.erpui-workspace-scroll>&[data-mode=fill]]:flex",
        "astw:[.erpui-workspace-scroll>&[data-mode=fill]]:flex-col",
        "astw:[.erpui-workspace-scroll>&[data-mode=flush]]:h-full",
        "astw:[.erpui-workspace-scroll>&[data-mode=flush]]:max-w-none",
        "astw:[.erpui-workspace-scroll>&[data-mode=flush]]:p-0",
        "astw:[@media(max-width:1200px)]:[.erpui-workspace-scroll>&:not([data-mode=flush])]:pt-6",
        "astw:[@media(max-width:1200px)]:[.erpui-workspace-scroll>&:not([data-mode=flush])]:px-5",
        "astw:[@media(max-width:1200px)]:[.erpui-workspace-scroll>&:not([data-mode=flush])]:pb-4",
        "astw:[@media(max-width:700px)]:[.erpui-workspace-scroll>&:not([data-mode=flush])]:pt-5",
        "astw:[@media(max-width:700px)]:[.erpui-workspace-scroll>&:not([data-mode=flush])]:px-3",
        "astw:[@media(max-width:700px)]:[.erpui-workspace-scroll>&:not([data-mode=flush])]:pb-3",
        className,
      )}
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
