import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Presentation only: routing, authentication and selectors belong to the app. */
export function HeaderBar({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="header-bar"
      className={cn(
        "astw:flex astw:h-14 astw:shrink-0 astw:items-center astw:justify-between astw:gap-2 astw:border-b astw:border-border astw:px-4",
        className,
      )}
      {...props}
    />
  );
}

// Shared with the existing non-collapsible AppShell sidebar.
export const sidebarPanelClasses =
  "astw:bg-sidebar astw:text-sidebar-foreground astw:flex astw:min-h-0 astw:min-w-0 astw:flex-col";

/** A sidebar region without AppShell's router or collapse state. */
export function SidebarPanel({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar-panel"
      className={cn(sidebarPanelClasses, className)}
      {...props}
    />
  );
}
