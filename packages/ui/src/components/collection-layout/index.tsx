import { cn } from "@/lib/utils";
import type { ComponentProps, CSSProperties } from "react";
import { Toolbar } from "../toolbar";
function Root({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "erpui-collection-layout astw:h-full astw:min-h-0 astw:min-w-0 astw:flex astw:flex-col astw:bg-card",
        "astw:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
function Heading({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "erpui-collection-heading astw:flex astw:items-center astw:justify-between astw:gap-4 astw:pt-0",
        "astw:px-0 astw:pb-5 astw:flex-wrap astw:shrink-0 astw:[&>div]:flex astw:[&>div]:items-center",
        "astw:[&>div]:gap-2 astw:[@media(max-width:800px)]:pt-0 astw:[@media(max-width:800px)]:px-0",
        "astw:[@media(max-width:800px)]:pb-4 astw:[@media(max-width:800px)]:gap-3",
        "astw:[@media(max-width:800px)]:[&>div]:gap-1.5",
        className,
      )}
      {...props}
    />
  );
}
function Collection({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "erpui-collection astw:flex-1 astw:min-h-0 astw:min-w-0 astw:flex astw:flex-col astw:overflow-hidden",
        "astw:border astw:border-border astw:rounded-[9px] astw:bg-card",
        className,
      )}
      {...props}
    />
  );
}
function Tools({
  className = "",
  ...props
}: ComponentProps<typeof Toolbar.Row>) {
  return (
    <Toolbar.Row
      className={cn(
        "erpui-collection-tools astw:[.erpui-collection-layout_&]:flex",
        "astw:[.erpui-collection-layout_&]:items-center astw:[.erpui-collection-layout_&]:gap-4",
        "astw:[.erpui-collection-layout_&]:py-2.5 astw:[.erpui-collection-layout_&]:px-3",
        "astw:[.erpui-collection-layout_&]:border-b astw:[.erpui-collection-layout_&]:border-b-border",
        "astw:[.erpui-collection-layout_&]:shrink-0 astw:[.erpui-collection-layout_&]:min-w-0",
        "astw:[&_[data-slot=tabs-list]]:min-w-0 astw:[&_[data-slot=tabs-list]]:overflow-x-auto",
        "astw:[&_[data-slot=tabs-list]]:[scrollbar-width:none] astw:[&_[data-slot=tabs-list]]:justify-start",
        "astw:[&_[data-slot=tabs-list]::-webkit-scrollbar]:hidden astw:[&_[data-slot=tabs-tab]]:shrink-0",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:items-stretch",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:flex-col",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:gap-2",
        "astw:[@media(max-width:800px)]:[.erpui-collection-layout_&]:p-2",
        className,
      )}
      {...props}
    />
  );
}
function SearchActions({
  className = "",
  ...props
}: ComponentProps<typeof Toolbar.Group>) {
  return (
    <Toolbar.Group
      className={cn(
        "erpui-collection-search-actions astw:[.erpui-collection-layout_&]:flex",
        "astw:[.erpui-collection-layout_&]:items-center astw:[.erpui-collection-layout_&]:gap-1.5",
        "astw:[.erpui-collection-layout_&]:min-w-40 astw:[.erpui-collection-layout_&]:ml-auto",
        "astw:[.erpui-collection-layout_&]:[flex:0_1_320px]",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:ml-0",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:flex-auto",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:min-w-0",
        "astw:[@media(max-width:1100px)]:[.erpui-collection-layout_&]:w-full",
        className,
      )}
      {...props}
    />
  );
}
function Results({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "erpui-collection-results astw:flex-1 astw:min-w-0 astw:min-h-0 astw:overflow-auto",
        "astw:overscroll-contain astw:[&:focus-visible]:outline-2 astw:[&:focus-visible]:outline-solid",
        "astw:[&:focus-visible]:outline-ring astw:[&:focus-visible]:-outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}
function TableArea({
  className = "",
  minWidth = 640,
  interactive = false,
  style,
  ...props
}: ComponentProps<"div"> & { minWidth?: number; interactive?: boolean }) {
  return (
    <div
      data-interactive={interactive || undefined}
      className={cn(
        "erpui-collection-table astw:min-w-0 astw:[&_table]:min-w-[var(--erpui-collection-table-min-width)]",
        "astw:[&_th]:sticky astw:[&_th]:top-0 astw:[&_th]:z-1 astw:[&_th]:whitespace-nowrap",
        "astw:[&_th]:bg-card astw:[&_td]:max-w-95 astw:[&_td]:overflow-hidden astw:[&_td]:text-ellipsis",
        "astw:[&_td]:whitespace-nowrap astw:[&[data-interactive]_tbody_tr]:cursor-pointer",
        className,
      )}
      style={
        {
          "--erpui-collection-table-min-width": `${minWidth}px`,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
function Footer({ className = "", ...props }: ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "erpui-collection-footer astw:flex astw:items-center astw:justify-between astw:gap-3 astw:py-2.5",
        "astw:px-4 astw:border-t astw:border-t-border astw:text-muted-foreground astw:text-[12px]",
        "astw:shrink-0 astw:bg-card astw:[&>div]:flex astw:[&>div]:items-center astw:[&>div]:gap-1.5",
        "astw:[&>div>span]:mr-2 astw:[&>div>span]:whitespace-nowrap astw:[&>div>span]:tabular-nums",
        "astw:[@media(max-width:800px)]:p-2.5 astw:[@media(max-width:800px)]:gap-2",
        "astw:[@media(max-width:800px)]:text-[11px] astw:[@media(max-width:800px)]:[&>div]:gap-1",
        "astw:[@media(max-width:800px)]:[&>div>span]:mr-0.5",
        className,
      )}
      {...props}
    />
  );
}
export const CollectionLayout = {
  Root,
  Heading,
  Collection,
  Toolbar: Tools,
  SearchActions,
  Results,
  TableArea,
  Footer,
};
