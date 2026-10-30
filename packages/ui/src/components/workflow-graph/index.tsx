import { cn } from "@/lib/utils";
import { GraphControls } from "../graph-controls";
import { WorkflowNode } from "../workflow-node";
import { Alert } from "../alert";
import { Badge } from "../badge";
import dagre from "@dagrejs/dagre";
import { Button } from "../button";
import { Tooltip } from "../tooltip";
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  ArrowDownWideNarrow,
  Check,
  Clock3,
  FileCode2,
  Loader2,
  XCircle,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

export type WorkflowGraphState =
  "idle" | "running" | "succeeded" | "failed" | "changed";
export interface WorkflowGraphStep {
  id: string;
  title: string;
  subtitle: string;
  state: WorkflowGraphState;
  statusLabel: string;
  metric?: string;
}
export interface WorkflowGraphProps {
  docked: boolean;
  steps: WorkflowGraphStep[];
  links: { source: string; target: string }[];
  error?: string;
  hint?: ReactNode;
  onSelect: (id: string) => void;
  container?: ComponentProps<typeof Tooltip.Content>["container"];
  ariaLabel?: string;
}
type StepNode = Node<
  {
    id: string;
    title: string;
    subtitle: string;
    state: WorkflowGraphState;
    statusLabel: string;
    metric?: string;
    vertical: boolean;
    onMeasure: (id: string, width: number, height: number) => void;
  },
  "step"
>;
const StepCard = memo(function StepCard({ id, data }: NodeProps<StepNode>) {
  const updateInternals = useUpdateNodeInternals();
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = card.current;
    if (!element) return;
    const measure = () =>
      data.onMeasure(id, element.offsetWidth, element.offsetHeight);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [id, data.onMeasure]);
  useEffect(() => updateInternals(id), [id, data.vertical, updateInternals]);
  const StatusIcon =
    data.state === "running"
      ? Loader2
      : data.state === "succeeded"
        ? Check
        : data.state === "failed"
          ? XCircle
          : Clock3;
  return (
    <div ref={card}>
      <WorkflowNode
        title={data.title}
        subtitle={data.subtitle}
        icon={<FileCode2 size={15} />}
        metric={data.metric}
        status={
          <Badge
            variant={
              data.state === "succeeded"
                ? "subtle-success"
                : data.state === "failed"
                  ? "subtle-error"
                  : data.state === "running"
                    ? "subtle-info"
                    : data.state === "changed"
                      ? "subtle-warning"
                      : "neutral"
            }
          >
            <StatusIcon
              size={11}
              className={
                data.state === "running"
                  ? "erpui-workflow-graph-spin astw:animate-spin astw:motion-reduce:animate-none"
                  : ""
              }
            />
            {data.statusLabel}
          </Badge>
        }
      >
        <Handle
          className="astw:size-[5px]! astw:min-w-[5px] astw:min-h-[5px] astw:bg-white! astw:border! astw:border-[#9cabbf]!"
          type="target"
          position={data.vertical ? Position.Top : Position.Left}
          isConnectable={false}
        />
        <Handle
          className="astw:size-[5px]! astw:min-w-[5px] astw:min-h-[5px] astw:bg-white! astw:border! astw:border-[#9cabbf]!"
          type="source"
          position={data.vertical ? Position.Bottom : Position.Right}
          isConnectable={false}
        />
      </WorkflowNode>
    </div>
  );
});
const nodeTypes = { step: StepCard };

function Graph(props: WorkflowGraphProps) {
  const { docked, onSelect } = props;
  const [vertical, setVertical] = useState(docked);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const canvas = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const onMeasure = useCallback((id: string, width: number, height: number) => {
    if (!width || !height) return;
    setSizes((previous) =>
      previous[id]?.width === width && previous[id]?.height === height
        ? previous
        : { ...previous, [id]: { width, height } },
    );
  }, []);
  const flow = useReactFlow<StepNode>();
  const graphKey = JSON.stringify([
    props.steps.map((step) => step.id),
    props.links,
    vertical,
    sizes,
  ]);
  const { nodes, edges } = useMemo(() => {
    const steps: StepNode["data"][] = props.steps.map((step) => ({
      ...step,
      vertical,
      onMeasure,
    }));
    const ids = steps.map((step) => step.id);
    const links = props.links;
    const layout = new dagre.graphlib.Graph()
      .setGraph({
        rankdir: vertical ? "TB" : "LR",
        ranksep: 58,
        nodesep: 36,
        marginx: 20,
        marginy: 20,
      })
      .setDefaultEdgeLabel(() => ({}));
    ids.forEach((id) =>
      layout.setNode(id, sizes[id] ?? { width: 256, height: 148 }),
    );
    links.forEach((link) => layout.setEdge(link.source, link.target));
    dagre.layout(layout);
    const nodes: StepNode[] = steps.map((step, index) => ({
      id: ids[index],
      type: "step",
      className:
        "astw:border-0 astw:p-0 astw:bg-transparent astw:rounded-[6px] astw:cursor-pointer astw:outline-none",
      width: sizes[ids[index]]?.width ?? 256,
      height: sizes[ids[index]]?.height ?? 148,
      position: {
        x: layout.node(ids[index]).x - (sizes[ids[index]]?.width ?? 256) / 2,
        y: layout.node(ids[index]).y - (sizes[ids[index]]?.height ?? 148) / 2,
      },
      selected: selected === ids[index],
      ariaLabel: `${step.title} · ${step.statusLabel}。Enterで詳細を開く`,
      data: step,
    }));
    const edges: Edge[] = links.map((link) => ({
      ...link,
      id: `${link.source}:${link.target}`,
      type: "smoothstep",
      focusable: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 13,
        height: 13,
        color: "#9aa9bb",
      },
      className:
        "astw:[&>path]:stroke-[#9aa9bb]! astw:[&>path]:[stroke-width:1.3]!",
    }));
    return { nodes, edges };
  }, [props.steps, props.links, vertical, selected, sizes, onMeasure]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const update = () =>
      setVertical(docked && element.clientHeight > element.clientWidth);
    const observer = new ResizeObserver(update);
    update();
    observer.observe(element);
    return () => observer.disconnect();
  }, [docked]);
  useEffect(() => {
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void flow.fitView({
          padding: vertical ? 0.16 : 0.13,
          maxZoom: 1,
          duration: 0,
        });
      });
    };
    const observer = new ResizeObserver(fit);
    if (canvas.current) observer.observe(canvas.current);
    fit();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [graphKey, docked, flow]);
  function select(id: string) {
    setSelected(id);
    onSelect(id);
  }
  return (
    <div
      className={`erpui-workflow-graph astw:h-full astw:min-h-0 astw:flex astw:flex-col astw:bg-[#fbfcfe] ${docked ? "is-docked" : ""}`}
    >
      {props.error && (
        <Alert.Root
          variant="error"
          className="erpui-workflow-graph-validation"
          role="alert"
        >
          <Alert.Description>{props.error}</Alert.Description>
        </Alert.Root>
      )}
      <div
        ref={canvas}
        className="erpui-workflow-graph-canvas astw:relative astw:flex-1 astw:min-h-35"
        onKeyDownCapture={(event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            event.target instanceof HTMLElement &&
            event.target.classList.contains("react-flow__node")
          ) {
            const id = event.target.dataset.id as string;
            if (nodes.some((node) => node.id === id)) {
              event.preventDefault();
              event.stopPropagation();
              select(id);
            }
          }
        }}
      >
        <ReactFlow<StepNode>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.13, maxZoom: 1 }}
          aria-label={props.ariaLabel ?? "ワークフローグラフ"}
          onNodeClick={(_, node) => select(node.id)}
          onPaneClick={() => setSelected(null)}
          onMove={(_, viewport) => setZoom(Math.round(viewport.zoom * 100))}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          zoomOnDoubleClick={false}
          panOnScroll
          zoomOnScroll={false}
          zoomOnPinch
          minZoom={0.05}
          maxZoom={1.5}
          colorMode="light"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="#dce3ec"
          />
        </ReactFlow>
        <GraphControls
          className={cn(
            "erpui-workflow-graph-controls astw:[.erpui-workflow-graph_&]:absolute",
            "astw:[.erpui-workflow-graph_&]:w-max astw:[.erpui-workflow-graph_&]:max-w-[calc(100%_-_24px)]",
            "astw:[.erpui-workflow-graph_&]:bottom-2.5 astw:[.erpui-workflow-graph_&]:right-3",
          )}
          aria-label="パイプライングラフの表示操作"
          zoom={zoom}
          zoomOutLabel="パイプライングラフを縮小"
          zoomInLabel="パイプライングラフを拡大"
          fitViewLabel="パイプライングラフを全体表示"
          container={props.container}
          onZoomOut={() => void flow.zoomOut({ duration: 120 })}
          onZoomIn={() => void flow.zoomIn({ duration: 120 })}
          onFitView={() =>
            void flow.fitView({ padding: 0.13, maxZoom: 1, duration: 180 })
          }
        >
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  aria-label={
                    vertical ? "グラフを横に並べる" : "グラフを縦に並べる"
                  }
                  onClick={() => setVertical(!vertical)}
                >
                  <ArrowDownWideNarrow size={13} />
                </Button>
              }
            />
            <Tooltip.Content container={props.container}>
              {vertical ? "横に並べる" : "縦に並べる"}
            </Tooltip.Content>
          </Tooltip.Root>
        </GraphControls>
      </div>
      {docked && props.hint && (
        <div
          className={cn(
            "erpui-workflow-graph-hint astw:text-[9px] astw:text-[#9aa5b4] astw:py-[9px] astw:px-3 astw:flex",
            "astw:items-center astw:gap-1.5 astw:border-t astw:border-t-border",
            "astw:[@container_erpui-code-workspace_(max-width:1100px)]:hidden",
          )}
        >
          {props.hint}
        </div>
      )}
    </div>
  );
}
export function WorkflowGraph(props: WorkflowGraphProps) {
  return (
    <ReactFlowProvider>
      <Graph {...props} />
    </ReactFlowProvider>
  );
}
