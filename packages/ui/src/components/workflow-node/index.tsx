import type { ComponentProps, ReactNode } from "react";
/** A step's card; the graph owns handles, layout and selection. */
export function WorkflowNode({
  title,
  subtitle,
  icon,
  status,
  metric,
  children,
  className = "",
  ...props
}: Omit<ComponentProps<"article">, "title"> & {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  status: ReactNode;
  metric?: ReactNode;
}) {
  return (
    <article
      {...props}
      data-slot="workflow-node"
      className={`erpui-workflow-node ${className}`}
    >
      {children}
      <div className="erpui-workflow-node-title">
        {icon}
        <strong title={title}>{title}</strong>
      </div>
      <div className="erpui-workflow-node-subtitle">{subtitle}</div>
      <div className="erpui-workflow-node-status">
        {status}
        {metric && <span>{metric}</span>}
      </div>
    </article>
  );
}
