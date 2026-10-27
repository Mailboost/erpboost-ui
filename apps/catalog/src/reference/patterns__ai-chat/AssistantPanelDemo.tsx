// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { AssistantPanel } from "./AssistantPanel";

// Frame the panel at its intended docked size (≈380px wide, viewport-capped
// height). In a real app the surrounding layout provides this box — see the
// "Assistant panel" entry under Pages.
export const AssistantPanelDemo = () => (
  <div className="mx-auto h-[560px] w-full max-w-sm overflow-hidden rounded-xl border">
    <AssistantPanel />
  </div>
);
