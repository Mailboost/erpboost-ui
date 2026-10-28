import { GraphControls } from "../graph-controls";
import type * as React from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Tooltip } from "../tooltip";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  ArrowUpRight,
  Diamond,
  GitBranch,
  KeyRound,
  LayoutGrid,
  Link2,
  Search,
  Table2,
  X,
} from "lucide-react";
import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ErdSchema } from "./layout";
import { useErdDiagramT } from "./i18n";
import { cn } from "../../lib/utils";
import { useAppShellConfig } from "../../contexts/appshell-config-context";
import { buildErdGraph, type ErdTable } from "./layout";

export interface ErdDiagramProps {
  schema: ErdSchema;
  initialTable?: string;
  onOpenTable?: (name: string) => void;
  portalContainer?: React.ComponentProps<typeof Tooltip.Content>["container"];
  className?: string;
}
type TableNode = Node<
  {
    table: ErdTable;
    onOpen?: (name: string) => void;
    portalContainer?: React.ComponentProps<typeof Tooltip.Content>["container"];
  },
  "table"
>;
type RelationEdge = Edge<{ description: string }, "relation">;
const TableCard = memo(function TableCard({ id, data }: NodeProps<TableNode>) {
  const t = useErdDiagramT();
  const { table, onOpen, portalContainer } = data;
  const updateInternals = useUpdateNodeInternals();
  useEffect(() => updateInternals(id), [id, table.columns, updateInternals]);
  return (
    <article
      className="erpui-erd-table"
      aria-label={t("table", { name: table.id })}
    >
      <div className="erpui-erd-table-heading" title={table.label}>
        <Table2 size={14} aria-hidden="true" />
        <h3>{table.id}</h3>
        {onOpen && (
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="nodrag nopan"
                  aria-label={t("openTable", { name: table.id })}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(table.id);
                  }}
                >
                  <ArrowUpRight size={14} />
                </Button>
              }
            />
            <Tooltip.Content container={portalContainer}>
              {t("openData")}
            </Tooltip.Content>
          </Tooltip.Root>
        )}
      </div>
      <div className="erpui-erd-table-columns">
        {table.columns.map((column) => (
          <div
            key={column.name}
            className={`erpui-erd-column${column.primary ? " is-primary" : ""}`}
            title={`${column.label ?? column.name} · ${column.type}${column.primary ? ` · ${t("primaryKey")}` : ""}${column.foreign ? ` · ${t("foreignKey")}` : ""} · ${column.required ? t("required") : t("nullable")}`}
          >
            <span className="erpui-erd-column-icons">
              {column.primary ? (
                <KeyRound size={12} aria-label={t("primaryKey")} />
              ) : column.foreign ? (
                <Link2 size={12} aria-label={t("foreignKey")} />
              ) : (
                <Diamond
                  size={6}
                  fill={column.required ? "currentColor" : "none"}
                  aria-label={column.required ? t("required") : t("nullable")}
                />
              )}
            </span>
            <code>{column.name}</code>
            <span className="erpui-erd-column-type">{column.type}</span>
            {column.referenced && (
              <Handle
                type="source"
                position={Position.Right}
                id={`source:${column.name}`}
                isConnectable={false}
              />
            )}
            {column.foreign && (
              <Handle
                type="target"
                position={Position.Left}
                id={`target:${column.name}`}
                isConnectable={false}
              />
            )}
            {column.selfReference && (
              <Handle
                type="target"
                position={Position.Right}
                id={`self:${column.name}`}
                isConnectable={false}
              />
            )}
          </div>
        ))}
        {!table.columns.length && (
          <p className="erpui-erd-no-columns">{t("noKeys")}</p>
        )}
      </div>
    </article>
  );
});
function Relationship({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps<RelationEdge>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 7,
    offset: source === target ? 40 : 24,
  });
  return (
    <g>
      <title>{data?.description}</title>
      <BaseEdge path={path} style={style} interactionWidth={16} />
    </g>
  );
}
const nodeTypes = { table: TableCard };
const edgeTypes = { relation: Relationship };

function Diagram({
  schema: catalog,
  initialTable,
  onOpenTable,
  portalContainer,
  className,
}: ErdDiagramProps) {
  const t = useErdDiagramT();
  const locale = useAppShellConfig().configurations.locale;
  const [keysOnly, setKeysOnly] = useState(false);
  const graph = useMemo(
    () => buildErdGraph(catalog, keysOnly),
    [catalog, keysOnly],
  );
  const [selected, setSelected] = useState<string | null>(() =>
    catalog.models.some((model) => model.name === initialTable)
      ? initialTable!
      : null,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNode>([]);
  const initialized = useNodesInitialized();
  const flow = useReactFlow<TableNode, RelationEdge>();
  const [zoom, setZoom] = useState(100);
  const lastGraph = useRef<typeof graph | undefined>(undefined);
  const readyGraph = useRef<typeof graph | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);
  const searchId = useId();
  const matches = graph.tables.filter((table) =>
    `${table.id} ${table.label}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  const activeIndex = Math.min(searchIndex, matches.length - 1);
  const related = useMemo(
    () =>
      new Set(
        selected
          ? [
              selected,
              ...graph.relations.flatMap((relation) =>
                relation.fromTable === selected
                  ? [relation.toTable]
                  : relation.toTable === selected
                    ? [relation.fromTable]
                    : [],
              ),
            ]
          : [],
      ),
    [graph, selected],
  );

  function focusTable(name: string, duration = 220) {
    const node = flow.getNode(name);
    if (!node) return;
    const height = node.height ?? 200;
    const viewportHeight =
      searchRef.current
        ?.closest(".erpui-erd-view")
        ?.querySelector(".erpui-erd-flow")?.clientHeight ?? 600;
    // Tall tables start at their heading instead of hiding it above the canvas.
    void flow.setCenter(
      node.position.x + 150,
      node.position.y + Math.min(height / 2, (viewportHeight / 0.9 - 80) / 2),
      { zoom: 0.9, duration },
    );
  }
  function chooseTable(name: string) {
    setSelected(name);
    setSearch("");
    setSearchOpen(false);
    focusTable(name);
    searchInput.current?.blur();
  }
  function arrange() {
    setNodes(
      graph.tables.map((table) => ({
        id: table.id,
        type: "table",
        position: table.position,
        width: table.width,
        height: table.height,
        dragHandle: ".erpui-erd-table-heading",
        ariaLabel: t("moveTable", { name: table.id }),
        data: { table, onOpen: onOpenTable, portalContainer },
      })),
    );
    readyGraph.current = undefined;
  }
  useEffect(() => {
    if (lastGraph.current === graph) return;
    lastGraph.current = graph;
    arrange();
  }, [graph, onOpenTable]);
  useEffect(() => {
    if (
      !initialized ||
      !nodes.length ||
      nodes[0]?.data.table !== graph.tables[0] ||
      readyGraph.current === graph
    )
      return;
    const frame = requestAnimationFrame(() => {
      readyGraph.current = graph;
      if (selected && graph.tables.some((table) => table.id === selected))
        focusTable(selected, 0);
      else void flow.fitView({ padding: 0.12, maxZoom: 1, duration: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialized, graph, nodes]);
  useEffect(() => {
    if (!searchOpen) return;
    const outside = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Element))
        setSearchOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [searchOpen]);
  useEffect(() => {
    if (searchOpen)
      document
        .getElementById(`${searchId}-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [searchOpen, activeIndex, searchId]);
  const visibleNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        ariaLabel: t("moveTable", { name: node.id }),
        selected: node.id === selected,
        data: { ...node.data, onOpen: onOpenTable, portalContainer },
        className:
          selected && related.has(node.id) && node.id !== selected
            ? "erpui-erd-table-related"
            : "",
      })),
    [nodes, selected, related, onOpenTable, portalContainer, locale],
  );
  const edges: RelationEdge[] = useMemo(
    () =>
      graph.relations.map((relation) => {
        const active =
          selected === relation.fromTable || selected === relation.toTable;
        const description = `${relation.fromTable}.${relation.fromField} → ${relation.toTable}.${relation.toField} (${relation.optional ? t("nullable") : t("required")})`;
        return {
          id: relation.id,
          source: relation.toTable,
          target: relation.fromTable,
          type: "relation",
          sourceHandle: `source:${relation.toField}`,
          targetHandle: `${relation.fromTable === relation.toTable ? "self" : "target"}:${relation.fromField}`,
          data: { description },
          ariaLabel: description,
          focusable: true,
          style: {
            stroke: active ? "var(--primary)" : "var(--muted-foreground)",
            strokeWidth: active ? 1.5 : 1,
            opacity: selected && !active ? 0.12 : 0.85,
          },
        };
      }),
    [graph, selected, locale],
  );
  const relationCount = graph.relations.filter(
    (relation) =>
      relation.fromTable === selected || relation.toTable === selected,
  ).length;

  return (
    <section
      className={cn("erpui-erd-view", className)}
      aria-label={t("diagram")}
    >
      <div className="erpui-erd-toolbar">
        <div
          ref={searchRef}
          className="erpui-erd-search"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setSearchOpen(false);
          }}
        >
          <Search size={14} aria-hidden="true" />
          <Input
            ref={searchInput}
            role="combobox"
            aria-label={t("searchTables")}
            placeholder={t("searchPlaceholder")}
            aria-expanded={searchOpen}
            aria-controls={searchOpen ? `${searchId}-list` : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              searchOpen && activeIndex >= 0
                ? `${searchId}-${activeIndex}`
                : undefined
            }
            value={search}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearchOpen(false);
                searchInput.current?.blur();
              }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setSearchOpen(true);
                setSearchIndex((index) =>
                  Math.max(
                    0,
                    Math.min(
                      matches.length - 1,
                      index + (event.key === "ArrowDown" ? 1 : -1),
                    ),
                  ),
                );
              }
              if (event.key === "Enter" && matches[activeIndex]) {
                event.preventDefault();
                chooseTable(matches[activeIndex].id);
              }
            }}
          />
          {searchOpen && (
            <div
              className="erpui-erd-search-results"
              role="listbox"
              aria-label={t("tableOptions")}
              id={`${searchId}-list`}
            >
              {matches.map((table, index) => (
                <Button
                  variant="ghost"
                  size="sm"
                  key={table.id}
                  id={`${searchId}-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseTable(table.id)}
                >
                  <Table2 size={14} />
                  <span>
                    <strong>{table.id}</strong>
                    {table.label !== table.id && <small>{table.label}</small>}
                  </span>
                </Button>
              ))}
              {!matches.length && <p>{t("noMatches")}</p>}
            </div>
          )}
        </div>
        <span className="erpui-erd-count">
          {t("tableCount", { count: graph.tables.length })}
          <span>·</span>
          {t("relationCount", { count: graph.relations.length })}
        </span>
        <div className="erpui-erd-toolbar-actions">
          <label className="erpui-erd-key-filter">
            <Checkbox
              checked={keysOnly}
              onCheckedChange={(checked) => setKeysOnly(checked)}
            />
            {t("keysOnly")}
          </label>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={arrange}
                >
                  <LayoutGrid size={14} />
                  {t("arrange")}
                </Button>
              }
            />
            <Tooltip.Content container={portalContainer}>
              {t("arrangeCards")}
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </div>
      <div
        className="erpui-erd-flow"
        onKeyDownCapture={(event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            event.target instanceof HTMLElement &&
            event.target.classList.contains("react-flow__node")
          ) {
            const table = event.target.dataset.id;
            if (table) {
              event.preventDefault();
              event.stopPropagation();
              setSelected((current) => (current === table ? null : table));
            }
          }
        }}
      >
        <ReactFlow<TableNode, RelationEdge>
          nodes={visibleNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          aria-label={t("canvas")}
          ariaLabelConfig={{
            "node.a11yDescription.default": t("moveHint"),
            "node.a11yDescription.keyboardDisabled": t("moveHint"),
            "edge.a11yDescription.default": t("relationHint"),
            "controls.zoomIn.ariaLabel": t("zoomIn"),
            "controls.zoomOut.ariaLabel": t("zoomOut"),
          }}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) =>
            setSelected((current) => (current === node.id ? null : node.id))
          }
          onNodeDragStart={(_, node) => setSelected(node.id)}
          onPaneClick={() => setSelected(null)}
          onMove={(_, viewport) => setZoom(Math.round(viewport.zoom * 100))}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          zoomOnDoubleClick={false}
          panOnScroll
          zoomOnScroll={false}
          zoomOnPinch
          minZoom={0.04}
          maxZoom={2}
          colorMode="light"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--border)"
          />
          <MiniMap
            pannable
            zoomable
            style={{ width: 168, height: 116 }}
            ariaLabel={t("minimap")}
            onClick={(_, position) =>
              void flow.setCenter(position.x, position.y, {
                zoom: flow.getZoom(),
                duration: 180,
              })
            }
            nodeColor={(node) =>
              node.id === selected ? "var(--primary)" : "var(--muted)"
            }
            nodeStrokeColor={(node) =>
              node.id === selected ? "var(--primary)" : "var(--border)"
            }
            nodeBorderRadius={3}
            maskColor="color-mix(in srgb, var(--background) 70%, transparent)"
            maskStrokeColor="var(--muted-foreground)"
          />
        </ReactFlow>
        {!graph.tables.length && (
          <div className="erpui-erd-empty">
            <GitBranch size={24} />
            <p>{t("noTables")}</p>
          </div>
        )}
        {selected && (
          <div className="erpui-erd-selection">
            <Table2 size={13} />
            <code>{selected}</code>
            <span>{t("relationCount", { count: relationCount })}</span>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label={t("clearSelection")}
              onClick={() => setSelected(null)}
            >
              <X size={13} />
            </Button>
          </div>
        )}
        <GraphControls
          className="erpui-erd-controls"
          aria-label={t("controls")}
          zoom={zoom}
          minZoom={4}
          maxZoom={200}
          zoomOutLabel={t("zoomOutLabel")}
          zoomInLabel={t("zoomInLabel")}
          fitViewLabel={t("fitLabel")}
          container={portalContainer}
          onZoomOut={() => void flow.zoomOut({ duration: 120 })}
          onZoomIn={() => void flow.zoomIn({ duration: 120 })}
          onFitView={() => {
            setSelected(null);
            void flow.fitView({ padding: 0.1, maxZoom: 1, duration: 220 });
          }}
          zoomDisplay={
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="erpui-erd-scale"
                    aria-label={t("resetZoomLabel")}
                    onClick={() => void flow.zoomTo(1, { duration: 120 })}
                  >
                    {zoom}%
                  </Button>
                }
              />
              <Tooltip.Content container={portalContainer}>
                {t("resetZoom")}
              </Tooltip.Content>
            </Tooltip.Root>
          }
        />
      </div>
      <div className="erpui-erd-legend">
        <span>
          <KeyRound size={12} />
          {t("primaryKey")}
        </span>
        <span>
          <Link2 size={12} />
          {t("foreignKey")}
        </span>
        <span>
          <Diamond size={7} />
          {t("nullable")}
        </span>
        <span>
          <Diamond size={7} fill="currentColor" />
          {t("required")}
        </span>
        <small>{t("hint")}</small>
      </div>
    </section>
  );
}
export function ErdDiagram(props: ErdDiagramProps) {
  return (
    <ReactFlowProvider>
      <Diagram {...props} />
    </ReactFlowProvider>
  );
}
