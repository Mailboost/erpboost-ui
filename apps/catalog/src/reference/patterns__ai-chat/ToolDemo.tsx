// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput, type ToolState } from "./Tool";

// One card per lifecycle state. In a live loop you keep a single card per
// call id and update its state in place as stream parts arrive — see how
// mockAssistant.ts drives the assembled panel.
const CALLS: {
  state: ToolState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  defaultOpen?: boolean;
}[] = [
  { state: "input-streaming" },
  { state: "input-available", input: { query: "create purchase order" } },
  {
    state: "output-available",
    input: { query: "create purchase order" },
    output: {
      hits: [
        { id: "kb-12", title: "Creating purchase orders" },
        { id: "kb-31", title: "Order approval workflow" },
      ],
    },
    defaultOpen: true,
  },
  {
    state: "output-error",
    input: { query: "create purchase order" },
    errorText: "Upstream search timed out after 10s.",
  },
];

export const ToolDemo = () => (
  <div className="mx-auto flex w-full max-w-md flex-col gap-1.5">
    {CALLS.map((call) => (
      <Tool key={call.state} defaultOpen={call.defaultOpen}>
        <ToolHeader toolName="searchArticles" title="Search help articles" state={call.state} />
        <ToolContent>
          <ToolInput input={call.input} />
          <ToolOutput output={call.output} errorText={call.errorText} />
        </ToolContent>
      </Tool>
    ))}
  </div>
);
