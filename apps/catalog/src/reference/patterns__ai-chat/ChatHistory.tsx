// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { MessageSquare, Trash2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Grouped list of past conversations ("Today", "Yesterday", …) for reopening
// an earlier chat. Layout-agnostic: render it inside a panel view (as
// AssistantPanel does), a popover, or a sidebar section of a full chat page.
// Deleting is optional — pass `onDelete` to reveal a delete button on hover.

export type ChatHistoryItemData = {
  id: string;
  title: string;
};

export type ChatHistoryGroupData = {
  title: string;
  items: ChatHistoryItemData[];
};

export type ChatHistoryProps = Omit<ComponentProps<"nav">, "onSelect"> & {
  groups: ChatHistoryGroupData[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export const ChatHistory = ({
  groups,
  activeId,
  onSelect,
  onDelete,
  className,
  ...props
}: ChatHistoryProps) => (
  <nav className={cn("flex flex-col gap-4", className)} aria-label="Conversation history" {...props}>
    {groups
      .filter((group) => group.items.length > 0)
      .map((group) => (
        <div key={group.title} className="space-y-0.5">
          <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {group.title}
          </div>
          {group.items.map((item) => {
            const active = item.id === activeId;
            return (
              <div
                key={item.id}
                className={cn(
                  "group flex w-full items-center rounded-md",
                  active ? "bg-muted" : "hover:bg-muted",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(item.id)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <MessageSquare className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.title}</span>
                </button>
                {onDelete ? (
                  <button
                    type="button"
                    aria-label={`Delete "${item.title}"`}
                    onClick={() => onDelete(item.id)}
                    className="mr-1 hidden shrink-0 rounded p-1 text-muted-foreground hover:text-destructive group-hover:block"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
  </nav>
);
