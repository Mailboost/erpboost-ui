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
import "./style.css";
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
      className={`erpui-result-panel ${className}`}
    >
      <ResultContext.Provider
        value={{
          id,
          tabId: `${id}-${value}`,
          graph: !!tabs.find((tab) => tab.value === value)?.graph,
        }}
      >
        <CodeWorkspace.ResultsHeader
          className="erpui-result-panel-header"
          actions={actions}
        >
          <Tabs.Root
            className="erpui-result-panel-tabs-root"
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
              className="erpui-result-panel-tabs"
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
      className={`erpui-result-panel-body ${className}`}
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
      className={`erpui-result-selection ${className}`}
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
      className={`erpui-result-details ${className}`}
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
      className={`erpui-result-message ${className}`}
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
      className={`erpui-result-error-text ${props.className ?? ""}`}
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
