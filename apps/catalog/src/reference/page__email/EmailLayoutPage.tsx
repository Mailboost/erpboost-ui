// Reference example: https://ui.tailor.tech/page/email
import { useState } from "react";
import { Avatar, Badge, Button } from "@mailboost/erpboost-ui";
import {
  Archive,
  CornerUpLeft,
  CornerUpRight,
  Forward,
  Mail,
  MoreHorizontal,
  Search,
  Star,
  Trash2,
} from "lucide-react";

type Email = {
  id: string;
  from: { name: string; initials: string; email: string };
  to: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  unread: boolean;
  starred: boolean;
  label?: "Sales" | "Support" | "Billing";
};

const emails: Email[] = [
  {
    id: "e-1",
    from: {
      name: "Aiko Sato",
      initials: "AS",
      email: "aiko.sato@tailor-supply.co.jp",
    },
    to: "you@tailor.tech",
    subject: "PO #4421 — confirmation needed before EOD",
    preview:
      "Hi team, our PO #4421 hasn't been confirmed yet. Could you double check before end of day?",
    body: `Hi team,

Our purchase order #4421 hasn't been confirmed in your system yet. We need to ship the goods by end of day Friday to make our customer's deadline.

Could you double check on your side and let me know if anything is missing from our request? Happy to resend the spec sheet if helpful.

Thanks,
Aiko`,
    receivedAt: "10:14",
    unread: true,
    starred: true,
    label: "Sales",
  },
  {
    id: "e-2",
    from: {
      name: "Billing — Tailor",
      initials: "BT",
      email: "billing@tailor.tech",
    },
    to: "you@tailor.tech",
    subject: "Invoice INV-2026-0418 is ready",
    preview:
      "Your monthly invoice is now available. Payment is due in 14 days.",
    body: `Hello,

Your monthly invoice INV-2026-0418 for April is now available in the billing portal. Payment is due in 14 days.

Summary:
- Plan: Growth
- Users: 38
- Total: ¥124,000 (tax included)

Best,
Tailor Billing`,
    receivedAt: "Yesterday",
    unread: true,
    starred: false,
    label: "Billing",
  },
  {
    id: "e-3",
    from: {
      name: "Taro Tanaka",
      initials: "TT",
      email: "t.tanaka@tailor.tech",
    },
    to: "you@tailor.tech",
    subject: "Re: Warehouse sync delay — root cause",
    preview:
      "Got the report from ops. The ERP sync delay was caused by a stuck batch job overnight…",
    body: `Quick update —

Ops confirmed the warehouse sync delay was caused by a stuck batch job overnight. They restarted the worker around 06:30 and the queue is now empty.

I'll add a watchdog alert this week so we get paged before customers notice.

— Taro`,
    receivedAt: "Yesterday",
    unread: false,
    starred: false,
    label: "Support",
  },
  {
    id: "e-4",
    from: {
      name: "Nina Hoffmann",
      initials: "NH",
      email: "nina@northwind.de",
    },
    to: "you@tailor.tech",
    subject: "Intro: Northwind logistics partnership",
    preview:
      "Following up from the conference — would love 30 minutes next week to walk through a partnership proposal.",
    body: `Hi,

Lovely to meet you at the conference last week. As discussed, I'd love to set up 30 minutes next week to walk through a partnership proposal between Northwind and Tailor.

Are Tuesday or Thursday afternoons workable on your side?

Best regards,
Nina`,
    receivedAt: "Apr 9",
    unread: false,
    starred: true,
    label: "Sales",
  },
  {
    id: "e-5",
    from: {
      name: "Status updates",
      initials: "SU",
      email: "noreply@tailor.tech",
    },
    to: "you@tailor.tech",
    subject: "Weekly deploy summary — 3 releases, 0 incidents",
    preview:
      "Three releases shipped this week with no customer-facing incidents. Read the full digest…",
    body: `Weekly digest

- 3 releases shipped (Mon, Wed, Fri)
- 0 customer-facing incidents
- 2 dependency upgrades pending review

Full digest is available in the engineering portal.`,
    receivedAt: "Apr 7",
    unread: false,
    starred: false,
  },
];

const labelToBadge: Record<
  NonNullable<Email["label"]>,
  "outline-info" | "outline-success" | "outline-warning"
> = {
  Sales: "outline-info",
  Support: "outline-success",
  Billing: "outline-warning",
};

export const EmailLayoutPage = () => {
  const [selectedId, setSelectedId] = useState<string>(emails[0].id);
  const [query, setQuery] = useState("");
  const [reads, setReads] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(emails.map((email) => [email.id, !email.unread])),
  );
  const [stars, setStars] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(emails.map((email) => [email.id, email.starred])),
  );

  const filtered = emails.filter((email) => {
    if (!query.trim()) return true;
    const haystack =
      `${email.from.name} ${email.subject} ${email.preview}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const selected =
    emails.find((email) => email.id === selectedId) ?? emails[0];
  const selectedStarred = stars[selected.id];

  const selectEmail = (id: string) => {
    setSelectedId(id);
    setReads((prev) => ({ ...prev, [id]: true }));
  };

  const toggleStar = (id: string) => {
    setStars((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markUnread = () => {
    setReads((prev) => ({ ...prev, [selected.id]: false }));
  };

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-card">
      {/* === Left: stack list of emails === */}
      <aside className="flex w-80 shrink-0 flex-col border-r bg-card">
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="size-4" aria-hidden />
            <span>Inbox</span>
            <Badge variant="neutral">
              {filtered.filter((email) => !reads[email.id]).length}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" aria-label="More inbox actions">
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="border-b p-3">
          <label className="relative block">
            <Search
              className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search mail"
              className="w-full rounded-md border bg-background py-1.5 pl-7 pr-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="p-6 text-center text-xs text-muted-foreground">
              No messages match "{query}".
            </li>
          ) : (
            filtered.map((email) => {
              const active = email.id === selected.id;
              const unread = !reads[email.id];
              return (
                <li key={email.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => selectEmail(email.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectEmail(email.id);
                      }
                    }}
                    aria-current={active}
                    className={
                      active
                        ? "flex w-full cursor-pointer gap-3 border-b border-l-2 border-l-primary bg-muted/60 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        : "flex w-full cursor-pointer gap-3 border-b border-l-2 border-l-transparent px-4 py-3 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                    }
                  >
                    <Avatar.Root className="mt-0.5 size-8 shrink-0">
                      <Avatar.Fallback>{email.from.initials}</Avatar.Fallback>
                    </Avatar.Root>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={
                            unread
                              ? "truncate text-sm font-semibold"
                              : "truncate text-sm"
                          }
                        >
                          {email.from.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {email.receivedAt}
                        </span>
                      </div>
                      <div
                        className={
                          unread
                            ? "truncate text-xs font-medium"
                            : "truncate text-xs text-muted-foreground"
                        }
                      >
                        {email.subject}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {email.preview}
                      </p>
                      {email.label ? (
                        <span className="mt-1 inline-flex">
                          <Badge variant={labelToBadge[email.label]}>
                            {email.label}
                          </Badge>
                        </span>
                      ) : null}
                    </div>
                    {unread ? (
                      <span
                        className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      {/* === Right: email content with toolbar on top === */}
      <main className="flex flex-1 flex-col bg-card">
        {/* Toolbar above the message body */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <CornerUpLeft className="mr-1.5 size-4" aria-hidden />
              Reply
            </Button>
            <Button variant="ghost" size="sm">
              <CornerUpRight className="mr-1.5 size-4" aria-hidden />
              Reply all
            </Button>
            <Button variant="ghost" size="sm">
              <Forward className="mr-1.5 size-4" aria-hidden />
              Forward
            </Button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Archive"
              title="Archive"
            >
              <Archive className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={markUnread}
              aria-label="Mark as unread"
              title="Mark as unread"
            >
              <Mail className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleStar(selected.id)}
              aria-pressed={selectedStarred}
              aria-label={selectedStarred ? "Unstar" : "Star"}
              title={selectedStarred ? "Unstar" : "Star"}
            >
              <Star
                className={
                  selectedStarred
                    ? "size-4 fill-amber-400 text-amber-400"
                    : "size-4"
                }
                aria-hidden
              />
            </Button>
            <Button variant="ghost" size="sm" aria-label="More actions">
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto bg-card">
          <article className="mx-auto w-full max-w-3xl bg-card p-6">
            <header className="space-y-3 border-b pb-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold leading-tight">
                  {selected.subject}
                </h2>
                {selected.label ? (
                  <Badge variant={labelToBadge[selected.label]}>
                    {selected.label}
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <Avatar.Root>
                  <Avatar.Fallback>{selected.from.initials}</Avatar.Fallback>
                </Avatar.Root>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{selected.from.name}</span>
                    <span className="text-xs text-muted-foreground">
                      &lt;{selected.from.email}&gt;
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    To {selected.to} · {selected.receivedAt}
                  </div>
                </div>
              </div>
            </header>

            <div className="whitespace-pre-wrap bg-card py-5 text-sm leading-relaxed">
              {selected.body}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};
