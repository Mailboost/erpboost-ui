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

const barHorizontal = [
  { lane: "Content", backlog: 12 },
  { lane: "Finance", backlog: 7 },
  { lane: "Ops", backlog: 19 },
  { lane: "HR", backlog: 5 },
];

export const HorizontalBarChartCard = () => (
  <div className="h-56 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={barHorizontal}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="lane"
          stroke="var(--muted-foreground)"
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="backlog" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
