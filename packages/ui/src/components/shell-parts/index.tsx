import type { ComponentProps, ReactNode } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button, type ButtonProps } from "../button";
import { Skeleton } from "../skeleton";
import { cn } from "@/lib/utils";
import { Text } from "../text";

/** Presentation only: routing, authentication and selectors belong to the app. */
function HeaderRoot({
  className,
  layout = "default",
  ...props
}: ComponentProps<"header"> & { layout?: "default" | "context" }) {
  return (
    <header
      data-slot="header-bar"
      data-layout={layout}
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
function SidebarRoot({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar-panel"
      className={cn(sidebarPanelClasses, "erpui-sidebar-panel", className)}
      {...props}
    />
  );
}

/** Context breadcrumb presentation; the consumer owns selection and loading state. */
function Brand({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="header-brand"
      className={cn("erpui-header-brand", className)}
      {...props}
    />
  );
}
function Separator() {
  return (
    <span
      data-slot="header-separator"
      className="erpui-header-separator"
      aria-hidden="true"
    >
      /
    </span>
  );
}
function ContextItem({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="header-context-item"
      className={cn("erpui-header-context-item", className)}
      {...props}
    />
  );
}
function ContextTrigger({
  icon,
  children,
  className,
  ...props
}: ButtonProps & { icon?: ReactNode }) {
  return (
    <Button
      type="button"
      variant="ghost"
      {...props}
      className={cn("erpui-header-context-trigger", className)}
    >
      {icon}
      <span>{children}</span>
      <ChevronsUpDown size={13} aria-hidden="true" />
    </Button>
  );
}
function ContextLoading({
  icon,
  wide,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  icon?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      role="status"
      {...props}
      data-slot="header-context-loading"
      className={cn("erpui-header-context-trigger", className)}
    >
      {icon}
      <Skeleton
        className="erpui-header-context-skeleton"
        data-wide={wide || undefined}
        aria-hidden="true"
      />
      <ChevronsUpDown size={13} aria-hidden="true" />
    </div>
  );
}
export const HeaderBar = Object.assign(HeaderRoot, {
  Brand,
  Separator,
  ContextItem,
  ContextTrigger,
  ContextLoading,
});

/** Native navigation controls; routes and permission checks stay in the app. */
function Nav({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-panel-nav"
      className={cn("erpui-sidebar-nav", className)}
      {...props}
    />
  );
}
function NavLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <Text
      variant="label-sm"
      className={cn("erpui-sidebar-label", className)}
      render={<div data-slot="sidebar-panel-label" {...props} />}
    />
  );
}
function NavButton({
  active,
  disabled,
  onClick,
  className,
  ...props
}: ButtonProps & { active?: boolean }) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
        } else onClick?.(event);
      }}
      {...props}
      data-slot="sidebar-panel-button"
      className={cn("erpui-sidebar-nav-button", className)}
    />
  );
}
function Footer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-panel-footer"
      className={cn("erpui-sidebar-footer", className)}
      {...props}
    />
  );
}
function AccountTrigger({ className, ...props }: ButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      {...props}
      className={cn("erpui-sidebar-account-trigger", className)}
    />
  );
}
function Identity({
  name,
  description,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & {
  name: ReactNode;
  description: ReactNode;
}) {
  return (
    <span
      data-slot="sidebar-panel-identity"
      className={cn("erpui-sidebar-identity", className)}
      {...props}
    >
      <Text variant="label-sm" render={<strong />}>
        {name}
      </Text>
      <Text variant="body-sm" render={<span />}>
        {description}
      </Text>
    </span>
  );
}
export const SidebarPanel = Object.assign(SidebarRoot, {
  Nav,
  Label: NavLabel,
  Button: NavButton,
  Footer,
  AccountTrigger,
  Identity,
});
