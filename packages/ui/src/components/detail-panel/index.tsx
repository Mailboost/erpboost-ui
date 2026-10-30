import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import { RecordPanel, RecordPanelBody } from "../record-panel";
import { Tabs } from "../tabs";

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
            <span
              className={cn(
                "erpui-detail-panel-context astw:block astw:mb-1.5 astw:text-[11px] astw:leading-[1.5]",
                "astw:font-normal astw:tracking-[0] astw:text-muted-foreground",
              )}
            >
              {context}
            </span>
          )}
          <span
            className={cn(
              "erpui-detail-panel-title astw:flex astw:items-center astw:flex-wrap astw:gap-y-2 astw:gap-x-2.5",
              "astw:[&>span:first-child]:min-w-0 astw:[&>span:first-child]:wrap-anywhere",
            )}
          >
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
          className="erpui-detail-panel-tabs-root astw:shrink-0 astw:min-w-0"
        >
          <Tabs.List
            className={cn(
              "erpui-detail-panel-tabs astw:[&[data-slot=tabs-list]]:justify-start",
              "astw:[&[data-slot=tabs-list]]:shrink-0 astw:[&[data-slot=tabs-list]]:w-full",
              "astw:[&[data-slot=tabs-list]]:max-w-full astw:[&[data-slot=tabs-list]]:overflow-x-auto",
              "astw:[&[data-slot=tabs-list]]:pt-0 astw:[&[data-slot=tabs-list]]:px-6",
              "astw:[&[data-slot=tabs-list]]:pb-3 astw:[&[data-slot=tabs-list]]:border-b",
              "astw:[&[data-slot=tabs-list]]:border-b-border astw:[&_[data-slot=tabs-tab]]:gap-1.5",
              "astw:[&_[data-slot=tabs-tab]]:shrink-0 astw:[@media(max-width:520px)]:[&[data-slot=tabs-list]]:pt-0",
              "astw:[@media(max-width:520px)]:[&[data-slot=tabs-list]]:px-4",
              "astw:[@media(max-width:520px)]:[&[data-slot=tabs-list]]:pb-2.5",
            )}
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
      className={cn(
        "erpui-detail-panel-body astw:[.erpui-detail-panel_&]:flex-1 astw:[.erpui-detail-panel_&]:min-h-0",
        "astw:[.erpui-detail-panel_&]:min-w-0 astw:[.erpui-detail-panel_&]:overflow-auto",
        "astw:[.erpui-detail-panel_&]:overscroll-contain",
        "astw:[.erpui-detail-panel_&]:[scrollbar-gutter:stable] astw:[&:focus-visible]:outline-2",
        "astw:[&:focus-visible]:outline-solid astw:[&:focus-visible]:outline-ring",
        "astw:[&:focus-visible]:-outline-offset-2",
        "astw:[@media(max-width:520px)]:[.erpui-detail-panel_&]:p-3.5",
        className,
      )}
    />
  );
}
export const DetailPanel = { Root, Body };
