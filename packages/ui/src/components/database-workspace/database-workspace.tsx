import { useId, useRef, useEffect, type ReactNode } from "react";
import {
  Database,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Table2,
  X,
} from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Badge } from "../badge";
import { Tabs } from "../tabs";
import { cn } from "../../lib/utils";
import { useDatabaseWorkspaceT } from "./i18n";

export interface DatabaseWorkspaceProps {
  tables: readonly { name: string; label?: string }[];
  selectedTable?: string;
  openedTables: readonly string[];
  view: "records" | "erd";
  search: string;
  sidebarOpen: boolean;
  disabled?: boolean;
  canCreate?: boolean;
  title?: string;
  className?: string;
  sidebarActions?: ReactNode;
  renderTableActions?: (name: string) => ReactNode;
  onSearchChange: (value: string) => void;
  onSidebarOpenChange: (open: boolean) => void;
  onSelectTable: (name: string) => void;
  onCloseTable: (name: string) => void;
  onCloseDiagram: () => void;
  onCreateTable: () => void;
  children: ReactNode;
}

/** Database explorer chrome. Queries, permissions, typed editors and persistence stay in the app. */
export function DatabaseWorkspace({
  tables,
  selectedTable,
  openedTables,
  view,
  search,
  sidebarOpen,
  disabled,
  canCreate,
  title,
  className,
  sidebarActions,
  renderTableActions,
  onSearchChange,
  onSidebarOpenChange,
  onSelectTable,
  onCloseTable,
  onCloseDiagram,
  onCreateTable,
  children,
}: DatabaseWorkspaceProps) {
  const t = useDatabaseWorkspaceT();
  const id = useId();
  const selected = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selected.current?.scrollIntoView?.({ block: "nearest" });
  }, [selectedTable, search, sidebarOpen]);
  const normalizedSearch = search.normalize("NFKC").trim().toLocaleLowerCase();
  const visible = tables.filter((table) =>
    `${table.name} ${table.label ?? ""}`
      .normalize("NFKC")
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
  return (
    <div
      data-slot="database-workspace"
      className={cn(
        "astw:flex astw:min-h-0 astw:h-full astw:w-full astw:overflow-hidden astw:bg-background astw:text-foreground",
        className,
      )}
    >
      {sidebarOpen && (
        <aside
          id={`${id}-tables`}
          aria-label={t("tableList")}
          className="astw:flex astw:w-64 astw:max-w-[45vw] astw:shrink-0 astw:flex-col astw:border-r astw:border-border astw:bg-background"
        >
          <header className="astw:flex astw:items-center astw:gap-2 astw:px-4 astw:py-3">
            <Database className="astw:size-4 astw:shrink-0" />
            <h1 className="astw:text-label-md astw:font-semibold">
              {title ?? t("title")}
            </h1>
            <Badge variant="neutral">{tables.length}</Badge>
            <div className="astw:ml-auto astw:flex astw:gap-1">
              {sidebarActions}
            </div>
          </header>
          <div className="astw:space-y-2 astw:px-3 astw:pb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="astw:w-full"
              disabled={disabled || !canCreate}
              onClick={onCreateTable}
            >
              <Plus />
              {t("addTable")}
            </Button>
            <div className="astw:relative">
              <Search className="astw:pointer-events-none astw:absolute astw:left-2.5 astw:top-2.5 astw:size-4 astw:text-muted-foreground" />
              <Input
                aria-label={t("searchTables")}
                placeholder={t("searchTables")}
                className="astw:pl-8"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>
          <nav
            aria-label={t("databaseTables")}
            className="astw:min-h-0 astw:flex-1 astw:overflow-y-auto astw:px-2 astw:pb-3"
          >
            {visible.map((table) => (
              <div
                key={table.name}
                className={cn(
                  "astw:group astw:flex astw:items-center astw:gap-1 astw:rounded-md",
                  selectedTable === table.name && "astw:bg-primary/10",
                )}
              >
                <Button
                  ref={selectedTable === table.name ? selected : undefined}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={selectedTable === table.name}
                  title={
                    table.label && table.label !== table.name
                      ? `${table.name} — ${table.label}`
                      : table.name
                  }
                  className="astw:min-w-0 astw:flex-1 astw:justify-start astw:font-normal"
                  onClick={() => onSelectTable(table.name)}
                >
                  <Table2 className="astw:shrink-0" />
                  <span className="astw:truncate">{table.name}</span>
                </Button>
                {renderTableActions?.(table.name)}
              </div>
            ))}
            {!visible.length && (
              <p
                role="status"
                className="astw:p-4 astw:text-body-sm astw:text-muted-foreground"
              >
                {t("noMatchingTables")}
              </p>
            )}
          </nav>
        </aside>
      )}
      <section
        aria-label={t("workspace")}
        className="astw:flex astw:min-w-0 astw:min-h-0 astw:flex-1 astw:flex-col"
      >
        <header className="astw:flex astw:min-h-11 astw:shrink-0 astw:items-center astw:gap-1 astw:border-b astw:border-border astw:px-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={sidebarOpen ? t("closeTableList") : t("openTableList")}
            aria-expanded={sidebarOpen}
            aria-controls={`${id}-tables`}
            onClick={() => onSidebarOpenChange(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <Tabs.Root
            value={
              view === "erd"
                ? "diagram:erd"
                : selectedTable === undefined
                  ? ""
                  : `table:${selectedTable}`
            }
            onValueChange={(name) => {
              if (typeof name === "string" && name.startsWith("table:"))
                onSelectTable(name.slice("table:".length));
            }}
            variant="line"
            className="astw:min-w-0 astw:flex-1 astw:overflow-x-auto"
          >
            <Tabs.List aria-label={t("openTables")} className="astw:w-max">
              {openedTables
                .filter((name) => tables.some((table) => table.name === name))
                .map((name) => (
                  <div key={name} className="astw:flex astw:items-center">
                    <Tabs.Tab value={`table:${name}`}>
                      <Table2 className="astw:mr-1 astw:size-3.5" />
                      {name}
                    </Tabs.Tab>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("closeTableTab", { name })}
                      className="astw:size-6"
                      onClick={() => onCloseTable(name)}
                    >
                      <X className="astw:size-3" />
                    </Button>
                  </div>
                ))}
              {view === "erd" && (
                <div className="astw:flex astw:items-center">
                  <Tabs.Tab value="diagram:erd">
                    <GitBranch className="astw:mr-1 astw:size-3.5" />
                    {t("diagram")}
                  </Tabs.Tab>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("closeDiagram")}
                    className="astw:size-6"
                    onClick={onCloseDiagram}
                  >
                    <X className="astw:size-3" />
                  </Button>
                </div>
              )}
            </Tabs.List>
          </Tabs.Root>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("addNewTable")}
            disabled={disabled || !canCreate}
            onClick={onCreateTable}
          >
            <Plus />
          </Button>
        </header>
        <div
          data-slot="database-workspace-content"
          className="astw:flex astw:min-h-0 astw:min-w-0 astw:flex-1 astw:flex-col"
        >
          {children}
        </div>
      </section>
    </div>
  );
}
