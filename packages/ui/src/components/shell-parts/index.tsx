import type { ComponentProps, ReactNode } from "react";
import { Button, type ButtonProps } from "../button";
import { Text } from "../text";
import { cn } from "@/lib/utils";

/** Presentation only. Navigation and account state belong to the application. */
function Root({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      {...props}
      data-slot="sidebar-panel"
      className={cn(
        "astw:flex astw:min-h-0 astw:min-w-0 astw:flex-col astw:border-r astw:border-border astw:bg-sidebar astw:p-3 astw:text-sidebar-foreground",
        className,
      )}
    />
  );
}
function Nav({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      {...props}
      data-slot="sidebar-panel-nav"
      className={cn(
        "astw:mb-4 astw:grid astw:min-h-0 astw:gap-1 astw:overflow-auto",
        className,
      )}
    />
  );
}
function Label({ className, ...props }: ComponentProps<"div">) {
  return (
    <Text
      variant="label-sm"
      className={cn("astw:mt-4 astw:px-3 astw:py-2 astw:first:mt-0", className)}
      render={<div data-slot="sidebar-panel-label" {...props} />}
    />
  );
}
function NavButton({
  active,
  className,
  ...props
}: ButtonProps & { active?: boolean }) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      aria-current={active ? "page" : undefined}
      {...props}
      data-slot="sidebar-panel-button"
      className={cn("astw:w-full astw:min-w-0 astw:justify-start", className)}
    />
  );
}
function Footer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="sidebar-panel-footer"
      className={cn(
        "astw:relative astw:mt-auto astw:shrink-0 astw:pt-3",
        className,
      )}
    />
  );
}
function AccountTrigger({ className, ...props }: ButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      {...props}
      className={cn("astw:w-full astw:min-w-0 astw:justify-start", className)}
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
      {...props}
      data-slot="sidebar-panel-identity"
      className={cn(
        "astw:flex astw:min-w-0 astw:flex-col astw:gap-1",
        className,
      )}
    >
      <Text variant="label-sm" className="astw:truncate" render={<strong />}>
        {name}
      </Text>
      <Text variant="body-sm" className="astw:truncate" render={<span />}>
        {description}
      </Text>
    </span>
  );
}
export const SidebarPanel = Object.assign(Root, {
  Nav,
  Label,
  Button: NavButton,
  Footer,
  AccountTrigger,
  Identity,
});
