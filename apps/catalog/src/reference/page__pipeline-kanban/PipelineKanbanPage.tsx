// Reference example: https://ui.tailor.tech/page/pipeline-kanban
import { useCallback, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  DescriptionCard,
  Layout,
  Tabs,
  createColumnHelper,
  useDataTable,
} from "@mailboost/erpboost-ui";
import { LayoutGrid, Table2 } from "lucide-react";
import { RightSheet } from "../patterns__right-sheet-custom/RightSheet";
import {
  KanbanBoardCardDescription,
  KanbanBoardCardTitle,
  PipelineKanbanBoardView,
  type PipelineKanbanStage,
} from "./KanbanBoard";

type DealListView = "table" | "kanban";

type DealLifecycle = "OPEN" | "CLOSED";

type DealItem = {
  id: string;
  title: string;
  customer: string;
  value: number;
  lifecycle: DealLifecycle;
  stageId: string;
  expectedCloseDate: string;
  createdAt: string;
};

type PipelineDefinition = {
  id: string;
  name: string;
  stages: { id: string; name: string; category: string }[];
  deals: Omit<DealItem, "stageId">[];
};

const PIPELINES: PipelineDefinition[] = [
  {
    id: "new-logo",
    name: "New Logo",
    stages: [
      { id: "nl-lead", name: "Lead", category: "OPEN" },
      { id: "nl-qualified", name: "Qualified", category: "ACTIVE" },
      { id: "nl-proposal", name: "Proposal", category: "ACTIVE" },
      { id: "nl-negotiation", name: "Negotiation", category: "ACTIVE" },
      { id: "nl-won", name: "Won", category: "DONE" },
      { id: "nl-lost", name: "Lost", category: "CANCELED" },
    ],
    deals: [
      {
        id: "deal-101",
        title: "Acme Corp — platform rollout",
        customer: "Acme Corp",
        value: 4_800_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-06-30",
        createdAt: "2026-02-12",
      },
      {
        id: "deal-102",
        title: "Northwind — pilot expansion",
        customer: "Northwind Traders",
        value: 2_100_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-05-20",
        createdAt: "2026-03-04",
      },
      {
        id: "deal-103",
        title: "Globex — security review",
        customer: "Globex Industries",
        value: 950_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-04-28",
        createdAt: "2026-01-18",
      },
      {
        id: "deal-104",
        title: "Initech — annual contract",
        customer: "Initech",
        value: 6_200_000,
        lifecycle: "CLOSED",
        expectedCloseDate: "2026-03-15",
        createdAt: "2025-11-02",
      },
      {
        id: "deal-105",
        title: "Stark Industries — POC",
        customer: "Stark Industries",
        value: 1_350_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-07-10",
        createdAt: "2026-04-01",
      },
      {
        id: "deal-106",
        title: "Umbrella — compliance add-on",
        customer: "Umbrella Co.",
        value: 780_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-05-05",
        createdAt: "2026-02-28",
      },
    ],
  },
  {
    id: "expand",
    name: "Expand",
    stages: [
      { id: "ex-identified", name: "Identified", category: "OPEN" },
      { id: "ex-discovery", name: "Discovery", category: "ACTIVE" },
      { id: "ex-proposal", name: "Proposal", category: "ACTIVE" },
      { id: "ex-commit", name: "Commit", category: "ACTIVE" },
      { id: "ex-won", name: "Won", category: "DONE" },
      { id: "ex-churn-risk", name: "Churn risk", category: "CANCELED" },
    ],
    deals: [
      {
        id: "deal-201",
        title: "Contoso — seat upsell",
        customer: "Contoso Ltd.",
        value: 420_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-05-18",
        createdAt: "2026-03-20",
      },
      {
        id: "deal-202",
        title: "Fabrikam — module bundle",
        customer: "Fabrikam",
        value: 1_100_000,
        lifecycle: "OPEN",
        expectedCloseDate: "2026-06-02",
        createdAt: "2026-02-08",
      },
      {
        id: "deal-203",
        title: "Tailor Supply — analytics tier",
        customer: "Tailor Supply Co.",
        value: 680_000,
        lifecycle: "CLOSED",
        expectedCloseDate: "2026-04-01",
        createdAt: "2025-12-14",
      },
    ],
  },
];

const stageVariantMap: Record<string, "neutral" | "warning" | "success" | "error"> = {
  OPEN: "neutral",
  ACTIVE: "warning",
  DONE: "success",
  CANCELED: "error",
};

const lifecycleVariantMap: Record<DealLifecycle, "neutral" | "success"> = {
  OPEN: "neutral",
  CLOSED: "success",
};

const formatJpy = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const seedStageAssignments = (pipeline: PipelineDefinition): DealItem[] =>
  pipeline.deals.map((deal, index) => ({
    ...deal,
    stageId: pipeline.stages[index % pipeline.stages.length]!.id,
  }));

const buildInitialDeals = () =>
  Object.fromEntries(
    PIPELINES.map((pipeline) => [pipeline.id, seedStageAssignments(pipeline)]),
  ) as Record<string, DealItem[]>;

type DealRow = {
  id: string;
  title: string;
  customer: string;
  stageName: string;
  stageCategory: string;
  lifecycle: DealLifecycle;
  value: number;
  expectedCloseDate: string;
  createdAt: string;
};

const { column } = createColumnHelper<DealRow>();

const moveDeal = (
  deals: DealItem[],
  itemId: string,
  currentStageId: string,
  targetStageId: string,
  position?: number,
): DealItem[] => {
  const moving = deals.find((deal) => deal.id === itemId);
  if (!moving || currentStageId === targetStageId) return deals;

  const without = deals.filter((deal) => deal.id !== itemId);
  const updated: DealItem = { ...moving, stageId: targetStageId };

  const targetDeals = without.filter((deal) => deal.stageId === targetStageId);
  const otherDeals = without.filter((deal) => deal.stageId !== targetStageId);
  const insertAt =
    position == null ? targetDeals.length : Math.max(0, Math.min(position - 1, targetDeals.length));

  const nextTarget = [
    ...targetDeals.slice(0, insertAt),
    updated,
    ...targetDeals.slice(insertAt),
  ];

  return [...otherDeals, ...nextTarget];
};

const reorderDeal = (
  deals: DealItem[],
  itemId: string,
  stageId: string,
  position: number,
): DealItem[] => {
  const stageDeals = deals.filter((deal) => deal.stageId === stageId);
  const otherDeals = deals.filter((deal) => deal.stageId !== stageId);
  const index = stageDeals.findIndex((deal) => deal.id === itemId);
  if (index === -1) return deals;

  const without = stageDeals.filter((deal) => deal.id !== itemId);
  const insertAt = Math.max(0, Math.min(position - 1, without.length));
  const nextStage = [
    ...without.slice(0, insertAt),
    stageDeals[index]!,
    ...without.slice(insertAt),
  ];

  return [...otherDeals, ...nextStage];
};

const DealsTableView = ({
  rows,
  onSelectDeal,
}: {
  rows: DealRow[];
  onSelectDeal: (id: string) => void;
}) => {
  const columns = useMemo(
    () => [
      column({
        id: "title",
        label: "Deal",
        render: (row) => (
          <button
            type="button"
            className="text-left hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onSelectDeal(row.id);
            }}
          >
            {row.title}
          </button>
        ),
      }),
      column({
        id: "customer",
        label: "Customer",
        render: (row) => row.customer,
      }),
      column({
        id: "stage",
        label: "Stage",
        render: (row) => (
          <Badge variant={stageVariantMap[row.stageCategory] ?? "neutral"}>{row.stageName}</Badge>
        ),
      }),
      column({
        id: "lifecycle",
        label: "Status",
        render: (row) => (
          <Badge variant={lifecycleVariantMap[row.lifecycle]}>
            {row.lifecycle === "OPEN" ? "Open" : "Closed"}
          </Badge>
        ),
      }),
      column({
        id: "value",
        label: "Value",
        render: (row) => formatJpy(row.value),
      }),
      column({
        id: "expectedCloseDate",
        label: "Expected close",
        render: (row) => formatDate(row.expectedCloseDate),
      }),
      column({
        id: "createdAt",
        label: "Created",
        render: (row) => formatDate(row.createdAt),
      }),
    ],
    [onSelectDeal],
  );

  const table = useDataTable<DealRow>({
    columns,
    data: { rows },
  });

  return (
    <DataTable.Root value={table}>
      <DataTable.Table />
    </DataTable.Root>
  );
};

const DealDetailSheet = ({
  deal,
  pipelineName,
  stageName,
  stageCategory,
  open,
  onOpenChange,
}: {
  deal: DealItem;
  pipelineName: string;
  stageName: string;
  stageCategory: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <RightSheet
    open={open}
    onOpenChange={onOpenChange}
    title={deal.title}
    description={deal.customer}
    expandHref="#"
  >
    <div className="space-y-4">
      <DescriptionCard
        title="Deal summary"
        data={{
          customer: deal.customer,
          pipeline: pipelineName,
          stage: stageName,
          lifecycle: deal.lifecycle === "OPEN" ? "Open" : "Closed",
          value: formatJpy(deal.value),
          expectedCloseDate: formatDate(deal.expectedCloseDate),
          createdAt: formatDate(deal.createdAt),
        }}
        fields={[
          { key: "customer", label: "Customer" },
          { key: "pipeline", label: "Pipeline" },
          {
            key: "stage",
            label: "Stage",
            type: "badge",
            meta: {
              badgeVariantMap: {
                [stageName]: stageVariantMap[stageCategory] ?? "neutral",
              },
            },
          },
          {
            key: "lifecycle",
            label: "Status",
            type: "badge",
            meta: {
              badgeVariantMap: {
                Open: "neutral",
                Closed: "success",
              },
            },
          },
          { key: "value", label: "Value" },
          { key: "expectedCloseDate", label: "Expected close" },
          { key: "createdAt", label: "Created" },
        ]}
      />
      <Card.Root>
        <Card.Header title="Next steps" description="Sample action panel for the sheet drilldown." />
        <Card.Content className="space-y-2 text-sm text-muted-foreground">
          <p>Review proposal terms with {deal.customer} before the expected close date.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm">Log activity</Button>
            <Button size="sm" variant="outline">
              Move stage
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </RightSheet>
);

export const PipelineKanbanPage = () => {
  const [view, setView] = useState<DealListView>("kanban");
  const [activePipelineId, setActivePipelineId] = useState(PIPELINES[0]!.id);
  const [dealsByPipeline, setDealsByPipeline] = useState(buildInitialDeals);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const pipeline = PIPELINES.find((item) => item.id === activePipelineId) ?? PIPELINES[0]!;
  const deals = dealsByPipeline[pipeline.id] ?? [];

  const stageNameById = useMemo(
    () => Object.fromEntries(pipeline.stages.map((stage) => [stage.id, stage.name])),
    [pipeline.stages],
  );
  const stageCategoryById = useMemo(
    () => Object.fromEntries(pipeline.stages.map((stage) => [stage.id, stage.category])),
    [pipeline.stages],
  );

  const stages: PipelineKanbanStage<DealItem>[] = useMemo(
    () =>
      pipeline.stages.map((stage) => ({
        ...stage,
        items: deals.filter((deal) => deal.stageId === stage.id),
      })),
    [deals, pipeline.stages],
  );

  const rows: DealRow[] = useMemo(
    () =>
      deals.map((deal) => ({
        id: deal.id,
        title: deal.title,
        customer: deal.customer,
        stageName: stageNameById[deal.stageId] ?? "",
        stageCategory: stageCategoryById[deal.stageId] ?? "",
        lifecycle: deal.lifecycle,
        value: deal.value,
        expectedCloseDate: deal.expectedCloseDate,
        createdAt: deal.createdAt,
      })),
    [deals, stageCategoryById, stageNameById],
  );

  const selectedDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) ?? null,
    [deals, selectedDealId],
  );

  const handleSelectDeal = useCallback((id: string) => {
    setSelectedDealId(id);
  }, []);

  const handleMoveItem = useCallback(
    ({
      itemId,
      currentStageId,
      targetStageId,
      position,
    }: {
      itemId: string;
      currentStageId: string;
      targetStageId: string;
      position?: number;
    }) => {
      setDealsByPipeline((previous) => ({
        ...previous,
        [pipeline.id]: moveDeal(
          previous[pipeline.id] ?? [],
          itemId,
          currentStageId,
          targetStageId,
          position,
        ),
      }));
    },
    [pipeline.id],
  );

  const handleReorderItem = useCallback(
    ({
      itemId,
      currentStageId,
      position,
    }: {
      itemId: string;
      currentStageId: string;
      position: number;
    }) => {
      setDealsByPipeline((previous) => ({
        ...previous,
        [pipeline.id]: reorderDeal(previous[pipeline.id] ?? [], itemId, currentStageId, position),
      }));
    },
    [pipeline.id],
  );

  return (
    <>
      <Layout columns={1} title="Deals">
      <Layout.Column>
        <div className="mb-1 flex w-full items-center justify-between gap-4">
          <Tabs.Root
            value={activePipelineId}
            onValueChange={setActivePipelineId}
            variant="line"
            className="min-w-0 gap-0"
          >
            <Tabs.List>
              {PIPELINES.map((item) => (
                <Tabs.Tab key={item.id} value={item.id}>
                  {item.name}
                  <Badge variant="neutral" className="ml-1.5">
                    {(dealsByPipeline[item.id] ?? []).length}
                  </Badge>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.Root>
          <div className="flex shrink-0 items-center gap-2">
            <Tabs.Root
              value={view}
              onValueChange={(value) => setView(value as DealListView)}
              variant="capsule"
              className="w-fit gap-0"
            >
              <Tabs.List aria-label="View mode">
                <Tabs.Tab value="table" aria-label="Table view" className="px-2">
                  <Table2 className="size-4" aria-hidden />
                </Tabs.Tab>
                <Tabs.Tab value="kanban" aria-label="Kanban view" className="px-2">
                  <LayoutGrid className="size-4" aria-hidden />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.Root>
            <Button>Create deal</Button>
          </div>
        </div>

        {view === "kanban" ? (
          <div className="-mt-1 min-h-[480px] flex-1">
            <PipelineKanbanBoardView
              stages={stages}
              unavailableTitle="Kanban unavailable"
              unavailableMessage="Unable to load the data required for kanban view."
              getItemId={(deal) => deal.id}
              getStageLabel={(stage) => stage.name}
              onMoveItem={handleMoveItem}
              onReorderItem={handleReorderItem}
              expandStageLabel={(stageLabel) => `Show ${stageLabel}`}
              hideStageLabel={(stageLabel) => `Hide ${stageLabel}`}
              renderCard={(deal) => (
                <>
                  <KanbanBoardCardTitle>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectDeal(deal.id);
                      }}
                    >
                      {deal.title}
                    </span>
                  </KanbanBoardCardTitle>
                  <KanbanBoardCardDescription>{deal.customer}</KanbanBoardCardDescription>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{formatJpy(deal.value)}</span>
                    <Badge variant={lifecycleVariantMap[deal.lifecycle]} className="text-xs">
                      {deal.lifecycle === "OPEN" ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </>
              )}
            />
          </div>
        ) : (
          <DealsTableView rows={rows} onSelectDeal={handleSelectDeal} />
        )}
      </Layout.Column>
    </Layout>

      {selectedDeal ? (
        <DealDetailSheet
          deal={selectedDeal}
          pipelineName={pipeline.name}
          stageName={stageNameById[selectedDeal.stageId] ?? ""}
          stageCategory={stageCategoryById[selectedDeal.stageId] ?? ""}
          open={selectedDealId != null}
          onOpenChange={(open) => {
            if (!open) setSelectedDealId(null);
          }}
        />
      ) : null}
    </>
  );
};
