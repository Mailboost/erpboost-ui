// Reference example: https://ui.tailor.tech/patterns/data-charts
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { tooltipStyle } from "./chartTokens";

const linePts = [
  { m: "Jan", v: 12 },
  { m: "Feb", v: 18 },
  { m: "Mar", v: 15 },
  { m: "Apr", v: 22 },
  { m: "May", v: 28 },
];

export const LineChartCard = () => (
  <div className="h-56 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={linePts} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="m" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="v"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-1)" }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
