// Reference example: https://ui.tailor.tech/patterns/notification-panel
import { useMemo, useState } from "react";
import { Badge, Button, Tabs } from "@mailboost/erpboost-ui";
import { Sliders } from "lucide-react";

type ReadFilter = "UNREAD" | "ALL";

type Notification = {
  id: string;
  category: "approval" | "mention" | "system";
  title: string;
  body: string;
  minutesAgo: number;
  isRead: boolean;
};

type Props = {
  notifications: Notification[];
};

const ui = {
  title: "Notifications",
  settings: "Settings",
  markAllRead: "Mark all as read",
  empty: "No notifications",
  unread: "Unread",
  unreadDot: "Unread",
  filterUnread: "Unread",
  filterAll: "All",
  filterAriaLabel: "Notification filter",
  category: {
    approval: "Approval",
    mention: "Mention",
    system: "System",
  },
  justNow: "just now",
  minute: (n: number) => `${n} min ago`,
  hour: (n: number) => `${n} h ago`,
  day: (n: number) => `${n} d ago`,
} as const;

const categoryVariant: Record<
  Notification["category"],
  "outline-info" | "outline-warning" | "outline-neutral"
> = {
  approval: "outline-warning",
  mention: "outline-info",
  system: "outline-neutral",
};

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

// Shared with list screen line tabs: a small pill badge
// rendering a count next to a tab label or section title.
const CountBadge = ({ count, active }: { count: number; active?: boolean }) => (
  <span
    className={
      active
        ? "rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
        : "rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
    }
  >
    {count}
  </span>
);

export const NotificationPanel = ({ notifications: initial }: Props) => {
  const now = useMemo(() => Date.now(), []);

  const [notifications, setNotifications] = useState(initial);
  const [activeTab, setActiveTab] = useState<ReadFilter>("UNREAD");

  const filtered =
    activeTab === "UNREAD" ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  const readFilterOptions: { value: ReadFilter; label: string }[] = [
    { value: "UNREAD", label: ui.filterUnread },
    { value: "ALL", label: ui.filterAll },
  ];

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const markOneRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l bg-card shadow-lg">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{ui.title}</h3>
          {hasUnread ? <CountBadge count={unreadCount} active /> : null}
        </div>
        <div className="flex items-center gap-1">
          {hasUnread ? (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              {ui.markAllRead}
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label={ui.settings}>
            <Sliders className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <div className="shrink-0 px-4 py-3">
        <Tabs.Root
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ReadFilter)}
          className="w-fit gap-0"
        >
          <Tabs.List aria-label={ui.filterAriaLabel}>
            {readFilterOptions.map((opt) => (
              <Tabs.Tab key={opt.value} value={opt.value}>
                {opt.value === "UNREAD" && hasUnread ?
                  <>
                    <span>{opt.label}</span>
                    <CountBadge count={unreadCount} active={activeTab === opt.value} />
                  </>
                : opt.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {ui.empty}
          </p>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((notification) => (
              <li key={notification.id} className="border-b last:border-b-0">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => markOneRead(notification.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      markOneRead(notification.id);
                    }
                  }}
                  className="flex w-full cursor-pointer items-start justify-start gap-3 px-4 py-3 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={
                      notification.isRead
                        ? "mt-1.5 size-2 shrink-0 rounded-full bg-transparent"
                        : "mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                    }
                    aria-label={notification.isRead ? undefined : ui.unreadDot}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={categoryVariant[notification.category]}>
                        {ui.category[notification.category]}
                      </Badge>
                      <time className="text-xs text-muted-foreground">
                        {formatRelative(notification.minutesAgo, now)}
                      </time>
                    </div>
                    <p
                      className={
                        notification.isRead
                          ? "truncate text-sm text-muted-foreground"
                          : "truncate text-sm font-medium"
                      }
                    >
                      {notification.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const sampleNotifications: Notification[] = [
  {
    id: "n-1",
    category: "approval",
    title: "PO #4421 is awaiting your approval",
    body: "Aiko Sato sent an approval request. Due today at 17:00.",
    minutesAgo: 5,
    isRead: false,
  },
  {
    id: "n-2",
    category: "mention",
    title: "Taro Tanaka mentioned you",
    body: "“Could you check the stock?” — on case #1284",
    minutesAgo: 60,
    isRead: false,
  },
  {
    id: "n-3",
    category: "system",
    title: "Weekly report is ready",
    body: "The 4/1 – 4/7 transaction summary is available.",
    minutesAgo: 60 * 3,
    isRead: false,
  },
  {
    id: "n-4",
    category: "approval",
    title: "Supplier registration approved",
    body: "Registration for Tailor Supply Co. is complete.",
    minutesAgo: 60 * 24,
    isRead: true,
  },
  {
    id: "n-5",
    category: "system",
    title: "Maintenance completed",
    body: "Maintenance finished as scheduled at 02:00.",
    minutesAgo: 60 * 24 * 2,
    isRead: true,
  },
];
