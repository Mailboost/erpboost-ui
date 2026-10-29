import type { ComponentProps, CSSProperties } from "react";
import { Toolbar } from "../toolbar";
import "./style.css";
function Root({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section className={`erpui-collection-layout ${className}`} {...props} />
  );
}
function Heading({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`erpui-collection-heading ${className}`} {...props} />;
}
function Collection({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`erpui-collection ${className}`} {...props} />;
}
function Tools({
  className = "",
  ...props
}: ComponentProps<typeof Toolbar.Row>) {
  return (
    <Toolbar.Row className={`erpui-collection-tools ${className}`} {...props} />
  );
}
function SearchActions({
  className = "",
  ...props
}: ComponentProps<typeof Toolbar.Group>) {
  return (
    <Toolbar.Group
      className={`erpui-collection-search-actions ${className}`}
      {...props}
    />
  );
}
function Results({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`erpui-collection-results ${className}`} {...props} />;
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
      className={`erpui-collection-table ${className}`}
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
    <footer className={`erpui-collection-footer ${className}`} {...props} />
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
