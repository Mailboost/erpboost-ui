import { useState, type FormEvent } from "react";
import { Badge, Button, Dialog, Input, Sheet } from "@mailboost/erpboost-ui";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  ChevronRight,
  GripVertical,
  Mail,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { RecordDetails, Status, initialOrders } from "./workspace";

type Message = { author: string; text: string; mine?: boolean; time: string };
const sampleMessages: Message[] = [
  {
    author: "Jordan Mitchell",
    text: "Could you confirm the delivery schedule for PO-2026-1001?",
    time: "10:30",
  },
  {
    author: "Alex Chen",
    text: "The supplier confirmed October 30. I have updated the order notes.",
    time: "10:34",
  },
  {
    author: "Jordan Mitchell",
    text: "Thank you. Please attach the updated quotation before approval.",
    time: "10:36",
  },
];
export function Conversation({
  assistant = false,
  composerOnly = false,
}: {
  assistant?: boolean;
  composerOnly?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(
      assistant
        ? [
            {
              author: "Assistant",
              text: "Hello! I can help you review the sample order data. What would you like to explore?",
              time: "Now",
            },
          ]
        : sampleMessages,
    ),
    [draft, setDraft] = useState("");
  function send(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      { author: "You", text: draft.trim(), mine: true, time: "Now" },
      ...(assistant
        ? [
            {
              author: "Assistant",
              text: "This is a local UI preview. Your message has been added to the sample conversation; no AI service is connected.",
              time: "Now",
            },
          ]
        : []),
    ]);
    setDraft("");
  }
  return (
    <div className="conversation">
      {!composerOnly && (
        <>
          <div className="demo-heading">
            <h3>{assistant ? "AI assistant" : "Conversation"}</h3>
            <Badge variant="neutral">Preview</Badge>
          </div>
          <div className="messages" aria-live="polite">
            {messages.map((message, i) => (
              <article
                key={i}
                className={`message ${message.mine ? "mine" : ""}`}
              >
                <span className="avatar-circle">
                  {message.author
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <div className="row">
                    <strong>{message.author}</strong>
                    <span className="small muted">{message.time}</span>
                  </div>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <form className="composer" onSubmit={send}>
        <label className="sr-only" htmlFor="message-composer">
          Message
        </label>
        <textarea
          id="message-composer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            assistant ? "Ask about your orders..." : "Write a reply..."
          }
        />
        <div className="row between">
          <label className="attachment-label">
            <Plus size={15} />
            Attach file
            <input
              type="file"
              onChange={(e) => {
                const name = e.target.files?.[0]?.name;
                if (name)
                  setDraft((d) => `${d}${d ? "\n" : ""}[Attachment: ${name}]`);
              }}
            />
          </label>
          <Button type="submit" disabled={!draft.trim()}>
            <Send size={14} />
            Send
          </Button>
        </div>
      </form>
      {composerOnly && messages.length > sampleMessages.length && (
        <p className="small muted" role="status">
          Reply added to this preview.
        </p>
      )}
    </div>
  );
}
export function ChatPage() {
  const [active, setActive] = useState("Supplier follow-up");
  return (
    <div className="mail-layout">
      <aside className="thread-list">
        <h3>Conversations</h3>
        {["Supplier follow-up", "Delivery schedule", "Invoice question"].map(
          (name) => (
            <button
              className={active === name ? "active" : ""}
              key={name}
              onClick={() => setActive(name)}
            >
              {name}
              <span className="muted small">Today</span>
            </button>
          ),
        )}
      </aside>
      <div className="mail-content">
        <h2>{active}</h2>
        <Conversation key={active} />
      </div>
    </div>
  );
}
export function EmailPage() {
  const [folder, setFolder] = useState("Inbox"),
    [active, setActive] = useState(0);
  return (
    <div className="email-page">
      <aside className="email-folders">
        <h3>
          <Mail size={18} />
          Mail
        </h3>
        {["Inbox", "Sent", "Drafts", "Archive"].map((name) => (
          <button
            key={name}
            className={folder === name ? "active" : ""}
            onClick={() => {
              setFolder(name);
              setActive(0);
            }}
          >
            {name}
            <span className="muted">
              {name === "Inbox" ? 3 : name === "Drafts" ? 1 : ""}
            </span>
          </button>
        ))}
      </aside>
      <aside className="thread-list">
        <h3>{folder}</h3>
        {[
          "Delivery confirmation",
          "Updated quotation",
          "Purchase order review",
        ].map((name, i) => (
          <button
            className={active === i ? "active" : ""}
            key={name}
            onClick={() => setActive(i)}
          >
            <strong>
              {["Alex Chen", "Jordan Mitchell", "Aoba Precision"][i]}
            </strong>
            <span>{name}</span>
            <span className="muted small">
              Thank you for your order. Please review...
            </span>
          </button>
        ))}
      </aside>
      <div className="mail-content">
        <h2>
          {
            [
              "Delivery confirmation",
              "Updated quotation",
              "Purchase order review",
            ][active]
          }
        </h2>
        <Conversation key={`${folder}-${active}`} />
      </div>
    </div>
  );
}
export function AssistantPage() {
  return (
    <div className="assistant-workspace">
      <div>
        <RecordDetails />
      </div>
      <aside>
        <Conversation assistant />
      </aside>
    </div>
  );
}

export function Approval({ builder = false }: { builder?: boolean }) {
  const [steps, setSteps] = useState([
      "Department manager",
      "Finance team",
      "Final approval",
    ]),
    [completed, setCompleted] = useState(1),
    [name, setName] = useState("");
  function move(index: number, direction: number) {
    setSteps((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [
        next[index + direction],
        next[index],
      ];
      return next;
    });
  }
  return (
    <div className="demo-card">
      <div className="demo-heading">
        <h3>{builder ? "Approval route" : "Approval progress"}</h3>
        <Badge variant={completed === steps.length ? "success" : "warning"}>
          {completed === steps.length ? "Approved" : "In progress"}
        </Badge>
      </div>
      <div className="approval-steps">
        {steps.map((step, i) => (
          <div className="approval-step" key={`${step}-${i}`}>
            <span className={`step-circle ${i < completed ? "done" : ""}`}>
              {i < completed ? <Check size={17} /> : i + 1}
            </span>
            <div>
              <strong>{step}</strong>
              <p className="small muted">
                {i < completed
                  ? "Approved · Today, 10:30"
                  : i === completed
                    ? "Awaiting approval"
                    : "Not started"}
              </p>
            </div>
            {builder && (
              <div className="row">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${step} up`}
                  disabled={!i}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${step} down`}
                  disabled={i === steps.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${step}`}
                  onClick={() => setSteps((s) => s.filter((_, j) => i !== j))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      {builder ? (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) {
              setSteps((s) => [...s, name.trim()]);
              setName("");
            }
          }}
        >
          <Input
            required
            placeholder="Approver or team"
            aria-label="New approver"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit">
            <Plus size={15} />
            Add step
          </Button>
        </form>
      ) : (
        <Button
          disabled={completed >= steps.length}
          onClick={() => setCompleted((n) => n + 1)}
        >
          Approve current step
        </Button>
      )}
    </div>
  );
}
export function Notifications() {
  const [read, setRead] = useState<number[]>([]);
  return (
    <div className="demo-card">
      <div className="demo-heading">
        <h3>Notifications</h3>
        <Button variant="ghost" size="sm" onClick={() => setRead([0, 1, 2])}>
          Mark all as read
        </Button>
      </div>
      {[
        "Your order was approved",
        "New supplier quotation received",
        "Delivery date updated",
      ].map((text, i) => (
        <button
          className="notification"
          key={text}
          onClick={() => setRead((r) => (r.includes(i) ? r : [...r, i]))}
        >
          <span className="notification-icon">
            <Bell size={17} />
          </span>
          <div>
            <strong>{text}</strong>
            <p className="muted small">
              PO-2026-{1001 + i} · {i + 1} hour ago
            </p>
          </div>
          {!read.includes(i) && <span className="unread-dot" />}
        </button>
      ))}
    </div>
  );
}
export function FieldDiff() {
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="demo-card">
      <div className="demo-heading">
        <h3>Proposed changes</h3>
        <Status value={accepted ? "Approved" : "Pending"} />
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Previous value</th>
            <th>Proposed value</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Delivery date", "2026-10-30", "2026-11-02"],
            ["Quantity", "100", "120"],
            ["Shipping method", "Standard", "Express"],
          ].map(([name, before, after]) => (
            <tr key={name}>
              <td>{name}</td>
              <td className={accepted ? "" : "diff-before"}>
                {accepted ? after : before}
              </td>
              <td className="diff-after">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row justify-end">
        <Button variant="outline" onClick={() => setAccepted(false)}>
          Reset
        </Button>
        <Button disabled={accepted} onClick={() => setAccepted(true)}>
          Accept changes
        </Button>
      </div>
    </div>
  );
}
export function Kanban({ manager = false }: { manager?: boolean }) {
  const [stages, setStages] = useState([
      "Draft",
      "Submitted",
      "Ordered",
      "Closed",
    ]),
    [rows, setRows] = useState(initialOrders.slice(0, 8)),
    [name, setName] = useState("");
  function move(id: string, status: string) {
    setRows((current) =>
      current.map((o) => (o.id === id ? { ...o, status } : o)),
    );
  }
  return (
    <div className="stack">
      <div className="demo-heading">
        <h2>{manager ? "Pipeline stages" : "Order pipeline"}</h2>
        <Badge variant="neutral">{rows.length} orders</Badge>
      </div>
      {manager && (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && !stages.includes(name.trim())) {
              setStages((s) => [...s, name.trim()]);
              setName("");
            }
          }}
        >
          <Input
            aria-label="Stage name"
            placeholder="New stage name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit">Add stage</Button>
        </form>
      )}
      <div className="kanban-board">
        {stages.map((stage, index) => (
          <section
            className="kanban-column"
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              move(e.dataTransfer.getData("text/plain"), stage);
            }}
          >
            <div className="row between">
              <strong>{stage}</strong>
              <Badge variant="neutral">
                {rows.filter((o) => o.status === stage).length}
              </Badge>
            </div>
            {rows
              .filter((o) => o.status === stage)
              .map((o) => (
                <article
                  className="kanban-card"
                  key={o.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", o.id)
                  }
                >
                  <div className="row between">
                    <strong>{o.id}</strong>
                    <GripVertical size={14} />
                  </div>
                  <p className="small muted">{o.supplier}</p>
                  <p>{o.reference}</p>
                  <div className="row between">
                    <strong>{o.amount.toLocaleString()} JPY</strong>
                    {index < stages.length - 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Move ${o.id} to ${stages[index + 1]}`}
                        onClick={() => move(o.id, stages[index + 1])}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    )}
                  </div>
                </article>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}
export function SupplierCascader() {
  const [region, setRegion] = useState("Japan"),
    [category, setCategory] = useState("Components"),
    [supplier, setSupplier] = useState("");
  const regions: Record<string, string[]> = {
    Japan: ["Components", "Manufacturing"],
    Europe: ["Logistics", "Components"],
    "North America": ["Components", "Services"],
  };
  return (
    <div className="demo-card stack">
      <h3>Select supplier</h3>
      <label className="form-field">
        Region
        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setCategory(regions[e.target.value][0]);
            setSupplier("");
          }}
        >
          {Object.keys(regions).map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Category
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSupplier("");
          }}
        >
          {regions[region].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Supplier
        <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
          <option value="">Select a supplier...</option>
          {[`${region} ${category} Co.`, `${region} ${category} Partners`].map(
            (v) => (
              <option key={v}>{v}</option>
            ),
          )}
        </select>
      </label>
      <p className="muted small" role="status">
        {supplier
          ? `${region} / ${category} / ${supplier}`
          : "Choose a region and category to narrow the supplier list."}
      </p>
    </div>
  );
}
export function ProfileDialog() {
  const [name, setName] = useState("Jordan Mitchell"),
    [email, setEmail] = useState("j.mitchell@example.com"),
    [open, setOpen] = useState(false);
  return (
    <>
      <button className="profile-trigger" onClick={() => setOpen(true)}>
        <span className="avatar-circle pink">
          {name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </span>
        <span>
          <strong>{name}</strong>
          <span className="muted">{email}</span>
        </span>
        <User size={18} />
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>Update your sample profile.</Dialog.Description>
          </Dialog.Header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            className="stack"
          >
            <label className="form-field">
              Name
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="form-field">
              Email
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <Dialog.Footer>
              <Button type="submit">Save profile</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
export function RightSheet() {
  return (
    <Sheet.Root>
      <Sheet.Trigger render={<Button />}>View order details</Sheet.Trigger>
      <Sheet.Content className="record-sheet">
        <Sheet.Header>
          <Sheet.Title>Purchase order details</Sheet.Title>
          <Sheet.Description>
            Review the order without leaving the list.
          </Sheet.Description>
        </Sheet.Header>
        <div className="sheet-scroll">
          <RecordDetails />
        </div>
      </Sheet.Content>
    </Sheet.Root>
  );
}
export function Timeline() {
  const [offset, setOffset] = useState(0);
  const tasks = [
    { name: "Order review", start: 0, length: 2 },
    { name: "Supplier confirmation", start: 2, length: 3 },
    { name: "Production", start: 4, length: 5 },
    { name: "Delivery", start: 8, length: 2 },
  ];
  return (
    <div className="demo-card">
      <div className="demo-heading">
        <h3>Delivery schedule</h3>
        <div className="row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((o) => o - 7)}
          >
            Previous week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((o) => o + 7)}
          >
            Next week
          </Button>
        </div>
      </div>
      <div className="table-scroll">
        <div className="timeline">
          <div className="timeline-label">Task</div>
          {Array.from({ length: 12 }, (_, i) => (
            <div className="timeline-date" key={i}>
              {new Date(2026, 9, 20 + i + offset).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}
            </div>
          ))}
          {tasks.map((task, index) => (
            <div className="timeline-row" key={task.name}>
              <strong>{task.name}</strong>
              <div className="timeline-track">
                <span
                  className={`timeline-bar tone-${index}`}
                  style={{
                    gridColumn: `${task.start + 1} / span ${task.length}`,
                  }}
                >
                  {task.length} days
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function BulkActions() {
  const [selected, setSelected] = useState(["PO-2026-1001", "PO-2026-1002"]),
    [notice, setNotice] = useState("");
  return (
    <div className="stack">
      <div className="demo-card">
        {initialOrders.slice(0, 4).map((o) => (
          <label className="row bulk-row" key={o.id}>
            <input
              type="checkbox"
              checked={selected.includes(o.id)}
              onChange={(e) =>
                setSelected((s) =>
                  e.target.checked ? [...s, o.id] : s.filter((v) => v !== o.id),
                )
              }
            />
            <strong>{o.id}</strong>
            <span className="muted">{o.supplier}</span>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="bulk-bar">
          <strong>{selected.length} selected</strong>
          <Button
            size="sm"
            onClick={() => {
              setNotice(`${selected.length} orders approved in this preview.`);
              setSelected([]);
            }}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNotice(`${selected.length} orders archived in this preview.`);
              setSelected([]);
            }}
          >
            Archive
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      )}
      <p role="status" className="small muted">
        {notice}
      </p>
    </div>
  );
}
