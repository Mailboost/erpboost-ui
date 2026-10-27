// Reference example: https://ui.tailor.tech/patterns/data-charts
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { chartFills, tooltipStyle } from "./chartTokens";

const pieSlices = [
  { name: "Direct", value: 38 },
  { name: "Partner", value: 27 },
  { name: "Inbound", value: 22 },
  { name: "Other", value: 13 },
];

export const DonutChartCard = () => (
  <div className="h-56 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={pieSlices}
          cx="42%"
          cy="50%"
          innerRadius={48}
          outerRadius={74}
          dataKey="value"
          nameKey="name"
        >
          {pieSlices.map((_, i) => (
            <Cell key={pieSlices[i].name} fill={chartFills[i % chartFills.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: "12px", width: "42%" }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
