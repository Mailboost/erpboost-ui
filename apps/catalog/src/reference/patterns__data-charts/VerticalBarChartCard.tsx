// Reference example: https://ui.tailor.tech/patterns/data-charts
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { tooltipStyle } from "./chartTokens";

const barVertical = [
  { name: "APAC", value: 48 },
  { name: "EMEA", value: 32 },
  { name: "LATAM", value: 14 },
  { name: "NA", value: 22 },
];

export const VerticalBarChartCard = () => (
  <div className="h-56 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={barVertical} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
