// Reference example: https://ui.tailor.tech/patterns/data-charts
/**
 * Shared style tokens for the chart cards on this page. Kept in one tiny
 * module so each chart's source file stays focused on the chart itself.
 */
export const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
} as const;

export const chartFills = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
