// Reference example: https://ui.tailor.tech/patterns/conversation-thread
import { useState } from "react";
import { Avatar, Badge, Button } from "@mailboost/erpboost-ui";
import { ThreadComposer } from "../patterns__thread-composer/ThreadComposer";
import { ConversationThreadPanel } from "./ConversationThreadPanel";
import { Textarea } from "../shared/textarea";
import {
  CornerUpLeft,
  Pencil,
  ThumbsUp,
} from "lucide-react";

type Message = {
  id: string;
  actor: { name: string; initials: string };
  internal: boolean;
  timestamp: string;
  body: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    actor: { name: "Aiko Sato (Customer)", initials: "AS" },
    internal: false,
    timestamp: "Apr 12, 10:14",
    body: "Hi team, our PO #4421 hasn't been confirmed yet. Could you check?",
  },
  {
    id: "m-2",
    actor: { name: "Taro Tanaka", initials: "TT" },
    internal: true,
    timestamp: "Apr 12, 10:31",
    body: "[Internal] Checked the warehouse — stock is fine, just an ERP sync delay.",
  },
  {
    id: "m-3",
    actor: { name: "Taro Tanaka", initials: "TT" },
    internal: false,
    timestamp: "Apr 12, 10:34",
    body: "Confirmed! Your PO has been processed and should ship by end of day.",
  },
];

export const ActionsThread = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [reply, setReply] = useState("");

  const toggleReaction = (id: string) => {
    setReactions((prev) => {
      const next = { ...prev };
      next[id] = (next[id] ?? 0) === 0 ? 1 : 0;
      return next;
    });
  };

  const startEdit = (message: Message) => {
    setEditingId(message.id);
    setEditDraft(message.body);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setMessages((prev) =>
      prev.map((message) =>
        message.id === editingId ? { ...message, body: editDraft } : message,
      ),
    );
    setEditingId(null);
    setEditDraft("");
  };

  return (
    <ConversationThreadPanel
      footer={
        <ThreadComposer
          value={reply}
          onChange={setReply}
          rows={3}
          showInternalToggle={false}
          header={
            replyTo ? (
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-1.5 text-xs">
                <span className="truncate">
                  Replying to <strong>{replyTo.actor.name}</strong>
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setReplyTo(null);
                    setReply("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : null
          }
          onDiscard={() => {
            setReply("");
            setReplyTo(null);
          }}
          submitDisabled={reply.length === 0}
        />
      }
    >
      {messages.map((message) => {
        const isEditing = editingId === message.id;
        const reacted = (reactions[message.id] ?? 0) > 0;
        return (
          <article
            key={message.id}
            className={
              message.internal
                ? "group -mx-2 flex gap-3 rounded-md bg-status-attention/5 px-2 py-2"
                : "group flex gap-3"
            }
          >
            <Avatar.Root className="mt-0.5 shrink-0">
              <Avatar.Fallback>{message.actor.initials}</Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0 flex-1">
              <header className="flex items-center gap-2 text-sm">
                <span className="font-medium">{message.actor.name}</span>
                {message.internal ? (
                  <Badge variant="warning">Internal</Badge>
                ) : null}
                <time className="text-xs text-muted-foreground">
                  {message.timestamp}
                </time>
                {!isEditing ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Edit"
                    title="Edit"
                    className="ml-auto h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => startEdit(message)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </header>

              {isEditing ? (
                <div className="mt-1 space-y-2">
                  <Textarea
                    value={editDraft}
                    onChange={(event) => setEditDraft(event.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveEdit}
                      disabled={editDraft.trim().length === 0}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm leading-relaxed">{message.body}</p>
              )}

              {!isEditing ? (
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="-ml-2 h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setReplyTo(message);
                      setReply(`> ${message.body}\n\n`);
                    }}
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                    Reply
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    aria-pressed={reacted}
                    className={
                      reacted
                        ? "h-7 gap-1.5 px-2 text-foreground"
                        : "h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                    }
                    onClick={() => toggleReaction(message.id)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {reacted ? "Liked" : "Like"}
                  </Button>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </ConversationThreadPanel>
  );
};
