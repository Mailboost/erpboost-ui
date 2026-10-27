// Reference example: https://ui.tailor.tech/patterns/conversation-thread
import { useMemo, useState } from "react";
import { Avatar, Badge, Button } from "@mailboost/erpboost-ui";
import { ThreadComposer } from "../patterns__thread-composer/ThreadComposer";
import { Textarea } from "../shared/textarea";
import { cn } from "@/lib/utils";
import { MarkdownThread } from "./MarkdownThread";
import { AttachmentsThread } from "./AttachmentsThread";
import { ActionsThread } from "./ActionsThread";
import { ConversationThreadPanel } from "./ConversationThreadPanel";

type Message = {
  id: string;
  actor: { name: string; initials: string; isCustomer?: boolean };
  internal: boolean;
  minutesAgo: number;
  body: string;
  replies?: Message[];
};

const ui = {
  customer: "Customer",
  internal: "Internal",
  internalNote: "Internal note (not sent to customer)",
  customerReplyPlaceholder: "Reply to customer…",
  internalPlaceholder: "Internal context for teammates…",
  discard: "Discard",
  sendReply: "Send",
  reply: "Reply",
  replyingTo: "Replying to",
  threadReplyPlaceholder: "Write a reply…",
  cancel: "Cancel",
  post: "Post",
  justNow: "just now",
  minute: (n: number) => `${n} min ago`,
  hour: (n: number) => `${n} h ago`,
  day: (n: number) => `${n} d ago`,
} as const;

const formatRelative = (minutesAgo: number, now: number) => {
  if (minutesAgo < 1) return ui.justNow;
  if (minutesAgo < 60) return ui.minute(minutesAgo);
  if (minutesAgo < 60 * 24) return ui.hour(Math.floor(minutesAgo / 60));
  const days = Math.floor(minutesAgo / (60 * 24));
  if (days < 30) return ui.day(days);
  const date = new Date(now - minutesAgo * 60 * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const flatMessages: Message[] = [
  {
    id: "f-1",
    actor: {
      name: "Aiko Sato",
      initials: "AS",
      isCustomer: true,
    },
    internal: false,
    minutesAgo: 6 * 60 + 20,
    body: "Hi team, our PO #4421 hasn't been confirmed yet. Could you check?",
  },
  {
    id: "f-2",
    actor: {
      name: "Taro Tanaka",
      initials: "TT",
    },
    internal: true,
    minutesAgo: 6 * 60 + 3,
    body: "Checked the warehouse — stock is fine, just an ERP sync delay.",
  },
  {
    id: "f-3",
    actor: {
      name: "Mika Inoue",
      initials: "MI",
    },
    internal: true,
    minutesAgo: 5 * 60 + 50,
    body: "FYI — I escalated to ERP ops, they're aware. Should clear within an hour.",
  },
  {
    id: "f-4",
    actor: {
      name: "Taro Tanaka",
      initials: "TT",
    },
    internal: false,
    minutesAgo: 5 * 60 + 26,
    body: "Confirmed! Your PO has been processed and should ship by end of day.",
  },
  {
    id: "f-5",
    actor: {
      name: "Aiko Sato",
      initials: "AS",
      isCustomer: true,
    },
    internal: false,
    minutesAgo: 4 * 60 + 12,
    body: "Thanks for the quick turnaround! Could you share a tracking link once it ships?",
  },
  {
    id: "f-6",
    actor: {
      name: "Taro Tanaka",
      initials: "TT",
    },
    internal: false,
    minutesAgo: 47,
    body: "Carrier picked up the shipment. Tracking: 1Z-TS-4421-998. ETA tomorrow 14:00.",
  },
];

const threadedMessages: Message[] = [
  {
    id: "t-1",
    actor: {
      name: "Mika Inoue",
      initials: "MI",
    },
    internal: false,
    minutesAgo: 4 * 60 * 24,
    body: "The ERP sync delay seems to correlate with the nightly warehouse job. Has anyone seen this before?",
    replies: [
      {
        id: "t-1-1",
        actor: {
          name: "Taro Tanaka",
          initials: "TT",
        },
        internal: false,
        minutesAgo: 3 * 60 * 24 + 8 * 60,
        body: "Yes — we saw this in Q3. Root cause was a connector retry loop. Sharing the post-mortem.",
      },
      {
        id: "t-1-2",
        actor: {
          name: "Kenta Hayashi",
          initials: "KH",
        },
        internal: false,
        minutesAgo: 3 * 60 * 24 + 2 * 60,
        body: "The retry behavior is fixed in connector v2.4. Worth confirming prod is on the right version.",
      },
    ],
  },
  {
    id: "t-2",
    actor: {
      name: "Aiko Sato",
      initials: "AS",
      isCustomer: true,
    },
    internal: false,
    minutesAgo: 22 * 60,
    body: "From the customer side — would it be possible to get a daily sync status digest?",
    replies: [
      {
        id: "t-2-1",
        actor: {
          name: "Mika Inoue",
          initials: "MI",
        },
        internal: true,
        minutesAgo: 21 * 60,
        body: "Good idea. We can pipe the ERP heartbeat into a daily mail. I'll spec this with Ops.",
      },
      {
        id: "t-2-2",
        actor: {
          name: "Mika Inoue",
          initials: "MI",
        },
        internal: false,
        minutesAgo: 90,
        body: "Aiko — we'll start sending a daily digest from next Monday. Sample attached in the next message.",
      },
    ],
  },
];

type MessageItemProps = {
  message: Message;
  now: number;
  isReply?: boolean;
  onReply?: (id: string) => void;
};

const MessageItem = ({ message, now, isReply, onReply }: MessageItemProps) => {
  return (
    <article
      className={cn(
        "group flex gap-3",
        message.internal ? "-mx-2 rounded-md bg-status-attention/5 px-2 py-2" : null,
      )}
    >
      <Avatar.Root className="mt-0.5 shrink-0">
        <Avatar.Fallback>{message.actor.initials}</Avatar.Fallback>
      </Avatar.Root>
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-2 text-sm">
          <span className="font-medium">{message.actor.name}</span>
          {message.actor.isCustomer ? (
            <Badge variant="outline-neutral">{ui.customer}</Badge>
          ) : null}
          {message.internal ? (
            <Badge variant="warning">{ui.internal}</Badge>
          ) : null}
          <time className="text-xs text-muted-foreground">
            {formatRelative(message.minutesAgo, now)}
          </time>
        </header>
        <p className={cn("text-sm leading-relaxed", isReply ? "mt-0.5" : "mt-1")}>
          {message.body}
        </p>
        {onReply ? (
          <div className="mt-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="-ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => onReply(message.id)}
            >
              {ui.reply}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

/** conversation-thread パターンのフラットスレッド本文（親 Layout なし／詳細ページのタブなどに埋め込み用）。 */
export const FlatInquiryThread = () => {
  const now = useMemo(() => Date.now(), []);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);

  return (
    <ConversationThreadPanel
      footer={
        <ThreadComposer
          value={reply}
          onChange={setReply}
          rows={4}
          internal={internal}
          onInternalChange={setInternal}
          customerPlaceholder={ui.customerReplyPlaceholder}
          internalPlaceholder={ui.internalPlaceholder}
          internalNoteLabel={ui.internalNote}
          discardLabel={ui.discard}
          submitLabel={ui.sendReply}
          onDiscard={() => setReply("")}
          submitDisabled={reply.length === 0}
        />
      }
    >
      {flatMessages.map((message) => (
        <MessageItem key={message.id} message={message} now={now} />
      ))}
    </ConversationThreadPanel>
  );
};

/** 詳細ページのタブなどへの埋め込み用（`FlatInquiryThread` と同一実装）。 */
export const EmbeddedFlatInquiryThread = FlatInquiryThread;

export const flatInquiryThreadMessageCount = flatMessages.length;

export const ThreadedInquiryThread = () => {
  const now = useMemo(() => Date.now(), []);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [post, setPost] = useState("");
  const [internal, setInternal] = useState(false);

  // 親スレッドは新しい順（minutesAgo が小さいほど新しい）。
  // 返信は会話の流れを保つためスレッド内では古い順のまま。
  const orderedThreads = useMemo(
    () =>
      [...threadedMessages].sort((a, b) => a.minutesAgo - b.minutesAgo),
    [],
  );

  return (
    <ConversationThreadPanel
      scrollContentClassName="space-y-4"
      header={
        <ThreadComposer
          value={post}
          onChange={setPost}
          rows={3}
          internal={internal}
          onInternalChange={setInternal}
          customerPlaceholder={ui.customerReplyPlaceholder}
          internalPlaceholder={ui.internalPlaceholder}
          internalNoteLabel={ui.internalNote}
          discardLabel={ui.discard}
          submitLabel={ui.post}
          onDiscard={() => setPost("")}
          submitDisabled={post.length === 0}
        />
      }
    >
      {orderedThreads.map((parent) => (
        <section key={parent.id} className="space-y-3">
          <MessageItem message={parent} now={now} onReply={setReplyingTo} />
          {parent.replies && parent.replies.length > 0 ? (
            <div className="ml-11 space-y-3">
              {parent.replies.map((child) => (
                <MessageItem
                  key={child.id}
                  message={child}
                  now={now}
                  isReply
                />
              ))}
            </div>
          ) : null}
          {replyingTo === parent.id ? (
            <div className="ml-11 space-y-2">
              <div className="text-xs text-muted-foreground">
                {ui.replyingTo} {parent.actor.name}
              </div>
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={ui.threadReplyPlaceholder}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setDraft("");
                  }}
                >
                  {ui.cancel}
                </Button>
                <Button type="button" disabled={draft.length === 0}>
                  {ui.post}
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ))}
    </ConversationThreadPanel>
  );
};

/** 詳細ページのタブなどへの埋め込み用（`ThreadedInquiryThread` と同一実装）。 */
export const EmbeddedThreadedInquiryThread = ThreadedInquiryThread;

export const threadedInquiryThreadMessageCount = threadedMessages.reduce(
  (total, parent) => total + 1 + (parent.replies?.length ?? 0),
  0,
);

export { MarkdownThread, AttachmentsThread, ActionsThread };
