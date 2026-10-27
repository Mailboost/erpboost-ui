// Reference example: https://ui.tailor.tech/patterns/data-charts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { tooltipStyle } from "./chartTokens";

const stacked = [
  { q: "Q1", backlog: 12, wip: 6, done: 9 },
  { q: "Q2", backlog: 18, wip: 8, done: 14 },
  { q: "Q3", backlog: 10, wip: 11, done: 16 },
];

export const StackedBarChartCard = () => (
  <div className="h-56 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={stacked} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="q" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="backlog" stackId="pipe" fill="var(--chart-4)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="wip" stackId="pipe" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="done" stackId="pipe" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
