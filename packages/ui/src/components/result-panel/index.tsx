import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import { CodeWorkspace } from "../code-workspace";
import { Tabs } from "../tabs";
import { Alert } from "../alert";
import { DescriptionList } from "../description-list";
export type ResultPanelTab<Value extends string = string> = {
  value: Value;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  graph?: boolean;
};
const ResultContext = createContext<{
  id: string;
  tabId: string;
  graph: boolean;
} | null>(null);
function Root<Value extends string>({
  tabs,
  value,
  onValueChange,
  tabListLabel,
  actions,
  children,
  panelId,
  className = "",
  ...props
}: Omit<ComponentProps<typeof CodeWorkspace.Results>, "children"> & {
  tabs: readonly ResultPanelTab<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  tabListLabel: string;
  actions?: ReactNode;
  children: ReactNode;
  panelId?: string;
}) {
  const generatedId = useId(),
    id = panelId ?? generatedId;
  return (
    <CodeWorkspace.Results
      {...props}
      className={`erpui-result-panel astw:[container:erpui-result-panel_/_inline-size] ${className}`}
    >
      <ResultContext.Provider
        value={{
          id,
          tabId: `${id}-${value}`,
          graph: !!tabs.find((tab) => tab.value === value)?.graph,
        }}
      >
        <CodeWorkspace.ResultsHeader
          className={cn(
            "erpui-result-panel-header astw:[&_[data-slot=code-workspace-results-actions]]:max-w-full",
            "astw:[&_[data-slot=code-workspace-results-actions]]:overflow-x-auto",
            "astw:[@container_erpui-result-panel_(max-width:520px)]:flex-wrap",
            "astw:[@container_erpui-result-panel_(max-width:520px)]:[&_[data-slot=code-workspace-results-actions]]:ml-0",
          )}
          actions={actions}
        >
          <Tabs.Root
            className={cn(
              "erpui-result-panel-tabs-root astw:flex-1 astw:min-w-0 astw:overflow-x-auto",
              "astw:[@container_erpui-result-panel_(max-width:520px)]:basis-full",
            )}
            value={value}
            variant="line"
            onValueChange={(next) => {
              const tab = tabs.find(
                (tab) => tab.value === next && !tab.disabled,
              );
              if (tab) onValueChange(tab.value);
            }}
          >
            <Tabs.List
              aria-label={tabListLabel}
              className="erpui-result-panel-tabs astw:[&[data-slot=tabs-list]]:justify-start astw:[&_[data-slot=tabs-tab]]:shrink-0"
            >
              {tabs.map((tab) => (
                <Tabs.Tab
                  key={tab.value}
                  value={tab.value}
                  id={`${id}-${tab.value}`}
                  aria-controls={id}
                  disabled={tab.disabled}
                >
                  {tab.icon}
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </CodeWorkspace.ResultsHeader>
        {children}
      </ResultContext.Provider>
    </CodeWorkspace.Results>
  );
}
function Body({
  className = "",
  ...props
}: Omit<
  ComponentProps<typeof CodeWorkspace.ResultsBody>,
  "id" | "role" | "aria-labelledby" | "graph"
>) {
  const context = useContext(ResultContext);
  if (!context)
    throw new Error("ResultPanel.Body must be inside ResultPanel.Root");
  return (
    <CodeWorkspace.ResultsBody
      {...props}
      className={cn(
        "erpui-result-panel-body astw:[&:focus-visible]:outline-2 astw:[&:focus-visible]:outline-solid",
        "astw:[&:focus-visible]:outline-ring astw:[&:focus-visible]:-outline-offset-2",
        className,
      )}
      graph={context.graph}
      id={context.id}
      role="tabpanel"
      aria-labelledby={context.tabId}
      tabIndex={props.tabIndex ?? 0}
    />
  );
}
/** Use Field.Root/Label and the caller's control as children; this layer never loads or selects data. */
function Selection({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="result-selection"
      className={cn(
        "erpui-result-selection astw:flex astw:flex-wrap astw:items-center astw:gap-2 astw:text-[10px]",
        "astw:py-2 astw:px-[13px] astw:border-b astw:border-b-border astw:min-w-0",
        "astw:[&>[data-slot=field]]:[flex:0_1_340px] astw:[&>[data-slot=field]]:min-w-0",
        "astw:[&>[data-slot=field]]:flex-row astw:[&>[data-slot=field]]:items-center",
        "astw:[&>[data-slot=field]]:gap-2 astw:[&_[data-slot=field-label]]:shrink-0",
        "astw:[&_[data-slot=field-label]]:whitespace-nowrap astw:[&_[data-slot=select-trigger]]:flex-1",
        "astw:[&_[data-slot=select-trigger]]:w-auto astw:[&_[data-slot=select-trigger]]:min-w-0",
        "astw:[&>code]:min-w-0 astw:[&>code]:wrap-anywhere",
        "astw:[@container_erpui-result-panel_(max-width:300px)]:[&>[data-slot=field]]:flex-col",
        "astw:[@container_erpui-result-panel_(max-width:300px)]:[&>[data-slot=field]]:items-stretch",
        "astw:[@container_erpui-result-panel_(max-width:300px)]:[&_[data-slot=select-trigger]]:flex-auto",
        "astw:[@container_erpui-result-panel_(max-width:300px)]:[&_[data-slot=select-trigger]]:w-full",
        className,
      )}
    />
  );
}
function Details({
  className = "",
  ...props
}: ComponentProps<typeof DescriptionList.Root>) {
  return (
    <DescriptionList.Root
      {...props}
      className={cn(
        "erpui-result-details astw:[.erpui-result-panel_&]:m-[15px]",
        "astw:[@container_erpui-result-panel_(max-width:520px)]:[.erpui-result-panel_&]:grid-cols-1",
        "astw:[@container_erpui-result-panel_(max-width:520px)]:[.erpui-result-panel_&_dt:not(:first-child)]:mt-2",
        className,
      )}
    />
  );
}
function Message({
  children,
  className = "",
  variant = "error",
  role = variant === "error" ? "alert" : "status",
  ...props
}: Omit<ComponentProps<typeof Alert.Root>, "children"> & {
  children: ReactNode;
}) {
  return (
    <Alert.Root
      {...props}
      variant={variant}
      role={role}
      className={cn(
        "erpui-result-message astw:my-2 astw:mx-3 astw:shrink-0 astw:min-w-0 astw:wrap-anywhere",
        "astw:[.erpui-result-panel-body[data-graph]>&]:max-h-20",
        "astw:[.erpui-result-panel-body[data-graph]>&]:overflow-auto",
        className,
      )}
    >
      <Alert.Description>{children}</Alert.Description>
    </Alert.Root>
  );
}
/** Preserve multi-line exception text verbatim. */
function ErrorText(props: ComponentProps<"pre">) {
  return (
    <pre
      {...props}
      className={cn(
        "erpui-result-error-text astw:m-0 astw:whitespace-pre-wrap astw:wrap-anywhere astw:[font:inherit]",
        props.className ?? "",
      )}
    />
  );
}
export const ResultPanel = {
  Root,
  Body,
  Selection,
  Details,
  Item: DescriptionList.Item,
  Message,
  ErrorText,
};
