// Reference example: https://ui.tailor.tech/page/chat
import { useMemo, useState } from "react";
import { Button } from "@mailboost/erpboost-ui";
import { Textarea } from "../shared/textarea";
import {
  Compass,
  Copy,
  Library,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content:
    | string
    | Array<{ kind: "text"; text: string } | { kind: "ol"; items: string[] }>;
};

type Conversation = {
  id: string;
  title: string;
  updatedMinutesAgo: number;
  messages: Message[];
};

const ui = {
  chatTitle: "Chat",
  newChat: "New Chat",
  library: "Library",
  explore: "Explore",
  recent: "Recent",
  search: "Search",
  share: "Share",
  inputPlaceholder: "What do you want to know?",
  send: "Send",
  copy: "Copy",
  goodResponse: "Good response",
  badResponse: "Bad response",
  regenerate: "Regenerate",
  more: "More",
  noMessages: "No messages in this conversation yet.",
  updated: (n: number) =>
    n < 60 ? `Updated ${n}m ago` : `Updated ${Math.floor(n / 60)}h ago`,
} as const;

const conversations: Conversation[] = [
  {
    id: "c-1",
    title: "Quick recipes for dinner",
    updatedMinutesAgo: 2,
    messages: [
      {
        id: "c-1-m-1",
        role: "user",
        content: "I don't have much time tonight. Any quick dinner ideas?",
      },
      {
        id: "c-1-m-2",
        role: "assistant",
        content: "Sure! Are you cooking for yourself or more people?",
      },
      {
        id: "c-1-m-3",
        role: "user",
        content: "Just for me. Something easy but not boring 😅",
      },
      {
        id: "c-1-m-4",
        role: "assistant",
        content: [
          {
            kind: "text",
            text: "Got it. Here are a few quick options (15-20 min):",
          },
          {
            kind: "ol",
            items: [
              "Garlic chicken stir-fry. Chicken breast, garlic, soy sauce, and frozen veggies. Serve with rice or tortillas.",
              "Pasta aglio e olio with a twist. Pasta, olive oil, garlic, chili flakes - add shrimp or mushrooms if you have them.",
              "Egg wrap or omelette. Eggs, cheese, whatever veggies you have, wrapped in a tortilla.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c-2",
    title: "Launch plan for Q3 rollout",
    updatedMinutesAgo: 60 * 3,
    messages: [],
  },
  {
    id: "c-3",
    title: "Rewrite homepage value prop",
    updatedMinutesAgo: 60 * 26,
    messages: [],
  },
  {
    id: "c-4",
    title: "Weekly team update summary",
    updatedMinutesAgo: 60 * 24 * 3,
    messages: [],
  },
];

type SidebarLinkProps = {
  icon: React.ReactNode;
  label: string;
};

const SidebarLink = ({ icon, label }: SidebarLinkProps) => (
  <a
    href="#"
    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-normal text-foreground hover:bg-muted"
  >
    <span className="text-muted-foreground">{icon}</span>
    <span>{label}</span>
  </a>
);

type RecentItemProps = {
  title: string;
  active?: boolean;
  onSelect?: () => void;
};

const RecentItem = ({ title, active, onSelect }: RecentItemProps) => (
  <a
    href="#"
    onClick={(event) => {
      event.preventDefault();
      onSelect?.();
    }}
    className={
      active
        ? "flex w-full items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-left text-sm font-medium text-foreground"
        : "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
    }
  >
    <MessageSquare className="size-4 shrink-0" aria-hidden />
    <span className="truncate">{title}</span>
  </a>
);

type ActionIconButtonProps = {
  icon: React.ReactNode;
  label: string;
};

const ActionIconButton = ({ icon, label }: ActionIconButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    aria-label={label}
    className="size-7 shrink-0"
  >
    {icon}
  </Button>
);

type AssistantMessageProps = {
  message: Message;
};

const AssistantMessage = ({ message }: AssistantMessageProps) => {
  const content = message.content;

  return (
    <div className="space-y-3">
      {Array.isArray(content) ? (
        <div className="space-y-3 text-[15px] leading-relaxed">
          {content.map((part, idx) =>
            part.kind === "text" ? (
              <p key={idx}>{part.text}</p>
            ) : (
              <ol key={idx} className="list-decimal space-y-2 pl-6">
                {part.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ),
          )}
        </div>
      ) : (
        <p className="text-[15px] leading-relaxed">{content}</p>
      )}

      <div className="flex items-center gap-1">
        <ActionIconButton
          icon={<Copy className="size-4" aria-hidden />}
          label={ui.copy}
        />
        <ActionIconButton
          icon={<ThumbsUp className="size-4" aria-hidden />}
          label={ui.goodResponse}
        />
        <ActionIconButton
          icon={<ThumbsDown className="size-4" aria-hidden />}
          label={ui.badResponse}
        />
        <ActionIconButton
          icon={<RefreshCw className="size-4" aria-hidden />}
          label={ui.regenerate}
        />
        <ActionIconButton
          icon={<MoreHorizontal className="size-4" aria-hidden />}
          label={ui.more}
        />
      </div>
    </div>
  );
};

type UserMessageProps = {
  message: Message;
};

const UserMessage = ({ message }: UserMessageProps) => {
  const text = typeof message.content === "string" ? message.content : "";
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2 text-[15px] leading-relaxed">
        {text}
      </div>
    </div>
  );
};

export const ChatScreen = () => {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [activeId],
  );

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-card">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
        <div className="flex shrink-0 items-center px-4 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {ui.chatTitle}
          </h2>
        </div>

        <div className="space-y-0.5 px-2">
          <SidebarLink
            icon={<Plus className="size-4" aria-hidden />}
            label={ui.newChat}
          />
          <SidebarLink
            icon={<Library className="size-4" aria-hidden />}
            label={ui.library}
          />
          <SidebarLink
            icon={<Compass className="size-4" aria-hidden />}
            label={ui.explore}
          />
        </div>

        <div className="mt-4 border-t" />

        <div className="mt-3 px-4 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {ui.recent}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {conversations.map((c) => (
            <RecentItem
              key={c.id}
              title={c.title}
              active={c.id === activeId}
              onSelect={() => setActiveId(c.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col bg-card">
        <header className="flex shrink-0 items-center gap-3 border-b px-6 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">{active.title}</h2>
            <p className="truncate text-xs text-muted-foreground">
              {ui.updated(active.updatedMinutesAgo)}
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            <Search className="mr-1.5 size-4" aria-hidden />
            {ui.search}
          </Button>
          <Button size="sm" type="button">
            <Share2 className="mr-1.5 size-4" aria-hidden />
            {ui.share}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto bg-card px-6 py-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {active.messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              ),
            )}
            {active.messages.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {ui.noMessages}
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t bg-card px-6 py-4">
          <div className="mx-auto w-full max-w-3xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setDraft("");
              }}
              className="flex items-end gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40"
            >
              <Textarea
                variant="plain"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={ui.inputPlaceholder}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={draft.trim().length === 0}
                aria-label={ui.send}
              >
                <Send className="size-4" aria-hidden />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
