import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import { RecordPanel, RecordPanelBody } from "../record-panel";
import { Tabs } from "../tabs";
import "./style.css";

export type DetailPanelTab = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};
const PanelContext = createContext<{ panelId: string; tabId: string } | null>(
  null,
);
function Root({
  title,
  context,
  badge,
  tabs,
  value,
  onValueChange,
  tabListLabel,
  panelId: providedId,
  children,
  className = "",
  ...props
}: Omit<ComponentProps<typeof RecordPanel>, "title" | "placement"> & {
  title: ReactNode;
  context?: ReactNode;
  badge?: ReactNode;
  tabs: readonly DetailPanelTab[];
  value: string;
  onValueChange: (value: string) => void;
  tabListLabel: string;
  panelId?: string;
}) {
  const generatedId = useId();
  const panelId = providedId ?? generatedId;
  return (
    <RecordPanel
      {...props}
      placement="right"
      className={`erpui-detail-panel ${className}`}
      title={
        <>
          {context && (
            <span className="erpui-detail-panel-context">{context}</span>
          )}
          <span className="erpui-detail-panel-title">
            <span>{title}</span>
            {badge}
          </span>
        </>
      }
    >
      <PanelContext.Provider value={{ panelId, tabId: `${panelId}-${value}` }}>
        <Tabs.Root
          value={value}
          onValueChange={(next) => {
            if (
              typeof next === "string" &&
              tabs.some((tab) => tab.value === next && !tab.disabled)
            )
              onValueChange(next);
          }}
          variant="line"
          className="erpui-detail-panel-tabs-root"
        >
          <Tabs.List
            className="erpui-detail-panel-tabs"
            aria-label={tabListLabel}
          >
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                id={`${panelId}-${tab.value}`}
                aria-controls={panelId}
                disabled={tab.disabled}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>
        {children}
      </PanelContext.Provider>
    </RecordPanel>
  );
}
/** Render exactly one Body, including loading/error states, for a stable tab/panel association. */
function Body({
  className = "",
  ...props
}: Omit<
  ComponentProps<typeof RecordPanelBody>,
  "id" | "role" | "aria-labelledby"
>) {
  const context = useContext(PanelContext);
  if (!context)
    throw new Error("DetailPanel.Body must be inside DetailPanel.Root");
  return (
    <RecordPanelBody
      {...props}
      id={context.panelId}
      role="tabpanel"
      aria-labelledby={context.tabId}
      tabIndex={props.tabIndex ?? 0}
      className={`erpui-detail-panel-body ${className}`}
    />
  );
}
export const DetailPanel = { Root, Body };
