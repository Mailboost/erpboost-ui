// Reference example: https://ui.tailor.tech/page/dashboard-with-charts
import { useMemo } from "react";
import {
  Badge,
  Card,
  DataTable,
  Layout,
  MetricCard,
  useDataTable,
} from "@mailboost/erpboost-ui";
import type { Column } from "@mailboost/erpboost-ui";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; value: number };

const monthly: Point[] = [
  { label: "Nov", value: 2.1 },
  { label: "Dec", value: 2.4 },
  { label: "Jan", value: 2.9 },
  { label: "Feb", value: 2.6 },
  { label: "Mar", value: 3.4 },
  { label: "Apr", value: 3.8 },
];

const metrics = [
  {
    key: "spend-mtd",
    title: "Spend MTD",
    value: "¥3.8M",
    trend: { direction: "up" as const, value: "+11.7%" },
  },
  {
    key: "open-pos",
    title: "Open POs",
    value: "48",
    description: "of which 7 overdue",
  },
  {
    key: "suppliers",
    title: "Suppliers",
    value: "116",
    description: "Active in last 90 days",
  },
  {
    key: "cycle-time",
    title: "Cycle time",
    value: "4.2d",
    trend: { direction: "down" as const, value: "-0.6d" },
  },
];

const byCategory: Point[] = [
  { label: "Electronics", value: 42 },
  { label: "Materials", value: 31 },
  { label: "Office", value: 14 },
  { label: "Other", value: 13 },
];

type OpenPoRow = {
  id: string;
  poNumber: string;
  supplier: string;
  amount: string;
  due: string;
  status: "Open" | "Overdue" | "In review";
};

const openPoRows: OpenPoRow[] = [
  {
    id: "po-1",
    poNumber: "PO-24089",
    supplier: "Tailor Supply Co.",
    amount: "¥420K",
    due: "May 18",
    status: "Open",
  },
  {
    id: "po-2",
    poNumber: "PO-24091",
    supplier: "East Works Ltd.",
    amount: "¥1.2M",
    due: "May 4",
    status: "Overdue",
  },
  {
    id: "po-3",
    poNumber: "PO-24102",
    supplier: "Northwind Materials",
    amount: "¥310K",
    due: "May 22",
    status: "In review",
  },
  {
    id: "po-4",
    poNumber: "PO-24105",
    supplier: "Acme Components",
    amount: "¥89K",
    due: "Jun 2",
    status: "Open",
  },
];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
} as const;

const MonthlySpendChart = ({ points }: { points: Point[] }) => (
  <div className="h-40 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="spend-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="var(--muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={28}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`¥${Number(value).toFixed(1)}M`, "Spend"]}
          cursor={{ stroke: "var(--border)" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#spend-area)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const CategoryBarsChart = ({ points }: { points: Point[] }) => {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={80}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [
              `${Math.round((Number(value) / total) * 100)}%`,
              "Share",
            ]}
            cursor={{ fill: "var(--muted)" }}
          />
          <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SpendDashboardPage = () => {
  const poColumns = useMemo<Column<OpenPoRow>[]>(
    () => [
      { id: "poNumber", label: "PO", render: (row) => row.poNumber },
      { id: "supplier", label: "Supplier", render: (row) => row.supplier },
      {
        id: "amount",
        label: "Amount",
        render: (row) => <span className="tabular-nums">{row.amount}</span>,
      },
      {
        id: "due",
        label: "Due",
        render: (row) => <span className="tabular-nums">{row.due}</span>,
      },
      {
        id: "status",
        label: "Status",
        render: (row) => {
          const variantMap = {
            Open: "neutral",
            Overdue: "error",
            "In review": "warning",
          } as const;
          const variant =
            variantMap[row.status as keyof typeof variantMap] ?? "neutral";
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
    ],
    [],
  );

  const poTable = useDataTable<OpenPoRow>({
    columns: poColumns,
    data: { rows: openPoRows, total: openPoRows.length },
  });

  return (
    <Layout>
      <Layout.Header title="Spend dashboard" />
      <Layout.Column>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.key}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              trend={metric.trend}
            />
          ))}
        </div>
        <Layout>
          <Layout.Column>
            <Card.Root>
              <Card.Header
                title="Monthly spend"
                description="Last 6 months · ¥M"
              />
              <Card.Content>
                <MonthlySpendChart points={monthly} />
              </Card.Content>
            </Card.Root>
          </Layout.Column>
          <Layout.Column>
            <Card.Root>
              <Card.Header
                title="Spend by category"
                description="Share of MTD spend"
              />
              <Card.Content>
                <CategoryBarsChart points={byCategory} />
              </Card.Content>
            </Card.Root>
          </Layout.Column>
        </Layout>
        <Card.Root className="w-full min-w-0 overflow-hidden">
          <Card.Header
            title="Open purchase orders"
            description="Highest-value lines · sample data"
          />
          <Card.Content className="astw:p-0 astw:first:pt-0">
            <DataTable.Root
              value={poTable}
              className="astw:rounded-none astw:border-0 astw:border-t"
            >
              <DataTable.Table />
            </DataTable.Root>
          </Card.Content>
        </Card.Root>
      </Layout.Column>
    </Layout>
  );
};
