// Reference example: https://ui.tailor.tech/page/assistant-panel
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge, Button } from "@mailboost/erpboost-ui";
import { AssistantPanel } from "../patterns__ai-chat/AssistantPanel";

// A regular work page with the AI assistant docked as an embedded right
// panel: the page keeps its own layout and scrolling, and the assistant
// augments it instead of owning the whole screen. The panel opens from a
// header button and closes from its own chevron — no modal, so users keep
// reading the page while they ask.
//
// The chat UI itself comes from the "AI chat" pattern; this screen only
// contributes the split layout and the open/close state.

const PANEL_WIDTH_CLASS = "w-[360px]";

type Article = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  updated: string;
};

const articles: Article[] = [
  {
    id: "kb-12",
    category: "Orders",
    title: "Creating purchase orders",
    excerpt:
      "Create an order from the supplier master, add lines, and route it through approval.",
    updated: "Updated 3 days ago",
  },
  {
    id: "kb-31",
    category: "Orders",
    title: "Order approval workflow",
    excerpt:
      "Approval chains by amount, delegation during absences, and the finance sign-off threshold.",
    updated: "Updated 1 week ago",
  },
  {
    id: "kb-07",
    category: "Suppliers",
    title: "Supplier master data policy",
    excerpt:
      "Required fields, naming rules, and who owns updates to bank details.",
    updated: "Updated 2 weeks ago",
  },
  {
    id: "kb-19",
    category: "Suppliers",
    title: "Supplier onboarding checklist",
    excerpt:
      "Registration form, compliance review, and the NDA needed before the first order.",
    updated: "Updated 1 month ago",
  },
  {
    id: "kb-24",
    category: "Receiving",
    title: "Recording inbound deliveries",
    excerpt: "Match deliveries to order lines and handle partial or damaged receipts.",
    updated: "Updated 1 month ago",
  },
  {
    id: "kb-28",
    category: "Receiving",
    title: "Handling late shipments",
    excerpt: "Escalation steps and how delays affect the supplier scorecard.",
    updated: "Updated 2 months ago",
  },
];

export const AssistantPanelScreen = () => {
  const [assistantOpen, setAssistantOpen] = useState(true);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-card">
      {/* Work page: unaffected by the assistant except for width. */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Knowledge base</h1>
            <p className="truncate text-xs text-muted-foreground">
              Guides and policies for daily operations
            </p>
          </div>
          {!assistantOpen ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssistantOpen(true)}
            >
              <Sparkles className="mr-1.5 size-4" aria-hidden />
              Ask assistant
            </Button>
          ) : null}
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-3 md:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.id}
                className="space-y-2 rounded-lg border p-4 hover:bg-muted/40"
              >
                <Badge variant="outline-neutral">{article.category}</Badge>
                <h2 className="text-sm font-medium">{article.title}</h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {article.excerpt}
                </p>
                <p className="text-[11px] text-muted-foreground">{article.updated}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Docked assistant: fixed width, own scrolling, non-modal. */}
      {assistantOpen ? (
        <aside className={`flex shrink-0 flex-col border-l ${PANEL_WIDTH_CLASS}`}>
          <AssistantPanel onClose={() => setAssistantOpen(false)} />
        </aside>
      ) : null}
    </div>
  );
};
