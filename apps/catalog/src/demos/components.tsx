import { useMemo, useState } from "react";
import {
  ActionPanel,
  Attachment,
  Badge,
  Button,
  Calendar,
  CollectionControlProvider,
  CsvImporter,
  DateField,
  DatePicker,
  Field,
  Fieldset,
  Form,
  Input,
  Link,
  WithGuard,
  hidden,
  pass,
  parseDate,
  useCollectionVariables,
  useOpenCommandPalette,
  type AttachmentItem,
} from "@mailboost/erpboost-ui";
import { Check, FileText, Plus, Send, Trash2 } from "lucide-react";
import { useLocale } from "../locale";

export function ButtonExamples() {
  return (
    <div className="stack">
      <div className="row wrap">
        {(
          [
            "default",
            "secondary",
            "outline",
            "ghost",
            "link",
            "destructive",
          ] as const
        ).map((variant, i) => (
          <Button key={variant} variant={variant}>
            {
              [
                "Primary",
                "Secondary",
                "Outline",
                "Ghost",
                "Link",
                "Destructive",
              ][i]
            }
          </Button>
        ))}
      </div>
      <div className="row wrap">
        {(["xs", "sm", "default", "lg"] as const).map((size) => (
          <Button key={size} size={size}>
            {size === "default" ? "Default" : size.toUpperCase()}
          </Button>
        ))}
        <Button size="icon" aria-label="Add item">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
export function AttachmentExample() {
  const [items, setItems] = useState<AttachmentItem[]>([
    { id: "quote", fileName: "quotation.pdf", mimeType: "application/pdf" },
  ]);
  return (
    <Attachment
      items={items}
      onUpload={(files) =>
        setItems((current) => [
          ...current,
          ...files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
          })),
        ])
      }
      onDelete={(item) =>
        setItems((current) => current.filter((i) => i.id !== item.id))
      }
      uploadHint="Files stay in this local preview."
    />
  );
}
export function ActionPanelExample() {
  const [message, setMessage] = useState("");
  return (
    <div className="stack">
      <ActionPanel
        title="Order actions"
        actions={[
          {
            key: "approve",
            label: "Approve order",
            icon: <Check />,
            onClick: () => setMessage("Order approved in this preview."),
          },
          {
            key: "send",
            label: "Send to ERP",
            icon: <Send />,
            onClick: () =>
              setMessage("Preview only — no ERP request was sent."),
          },
          {
            key: "export",
            label: "View document",
            icon: <FileText />,
            onClick: () => setMessage("Purchase order PO-2026-1001"),
          },
          {
            key: "delete",
            label: "Delete draft",
            icon: <Trash2 />,
            variant: "destructive",
            onClick: () => setMessage("Draft removed in this preview."),
          },
        ]}
      />
      <p className="small muted" role="status">
        {message}
      </p>
    </div>
  );
}
export function CalendarExample() {
  const [value, setValue] = useState(parseDate("2026-10-27"));
  return (
    <div className="stack">
      <Calendar value={value} onChange={setValue} aria-label="Select a date" />
      <p className="muted small">Selected: {value.toString()}</p>
    </div>
  );
}
export function DateExample({ picker = false }: { picker?: boolean }) {
  const [value, setValue] = useState<ReturnType<typeof parseDate> | null>(
    parseDate("2026-10-27"),
  );
  const Control = picker ? DatePicker : DateField;
  return (
    <Field.Root>
      <Field.Label>Delivery date</Field.Label>
      <Control value={value} onChange={setValue} aria-label="Delivery date" />
      <Field.Description>Choose the requested delivery date.</Field.Description>
    </Field.Root>
  );
}
export function FormExample() {
  const [message, setMessage] = useState("");
  return (
    <Form
      className="stack"
      onFormSubmit={(values) => setMessage(`Saved: ${String(values.name)}`)}
    >
      <Fieldset.Root className="stack">
        <Fieldset.Legend>Supplier information</Fieldset.Legend>
        <Field.Root name="name">
          <Field.Label>Company name</Field.Label>
          <Field.Control required placeholder="e.g. Aoba Precision" />
          <Field.Error match="valueMissing">
            Company name is required.
          </Field.Error>
        </Field.Root>
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control type="email" placeholder="contact@example.com" />
        </Field.Root>
      </Fieldset.Root>
      <Button type="submit">Save supplier</Button>
      <p className="small muted" role="status">
        {message}
      </p>
    </Form>
  );
}
export function GuardExample() {
  const [allowed, setAllowed] = useState(false);
  const guards = useMemo(
    () => [() => (allowed ? pass() : hidden())],
    [allowed],
  );
  return (
    <div className="stack">
      <label className="row">
        <input
          type="checkbox"
          checked={allowed}
          onChange={(e) => setAllowed(e.target.checked)}
        />
        Allow this sample action
      </label>
      <WithGuard
        guards={guards}
        fallback={<Badge variant="neutral">Action hidden</Badge>}
        loading={<span>Checking…</span>}
      >
        <Button>Manage orders</Button>
      </WithGuard>
    </div>
  );
}
export function CommandExample() {
  const open = useOpenCommandPalette();
  return (
    <div className="stack">
      <Button variant="outline" onClick={() => open()}>
        Open command palette
      </Button>
      <p className="muted small">
        Press ⌘K or Ctrl+K to search catalogue pages.
      </p>
    </div>
  );
}
export function AuthExample() {
  const [signedIn, setSignedIn] = useState(false);
  return (
    <div className="demo-card stack">
      <h3>{signedIn ? "Welcome, Jordan" : "Authentication states"}</h3>
      <p className="small muted">
        Local UI preview. Connect AuthProvider to your authentication service in
        your application.
      </p>
      <Badge variant={signedIn ? "success" : "neutral"}>
        {signedIn ? "Signed-in view" : "Signed-out view"}
      </Badge>
      <Button variant="outline" onClick={() => setSignedIn((v) => !v)}>
        {signedIn ? "Show signed-out view" : "Show signed-in view"}
      </Button>
    </div>
  );
}
export function CollectionControlExample() {
  const { control, variables } = useCollectionVariables({
    params: { pageSize: 10 },
  });
  return (
    <CollectionControlProvider value={control}>
      <div className="demo-card stack">
        <h3>Collection state</h3>
        <pre>{JSON.stringify(variables, null, 2)}</pre>
        <p className="small muted">
          A shared provider connects filtering, pagination and table controls.
        </p>
      </div>
    </CollectionControlProvider>
  );
}
export function CsvExample() {
  const [message, setMessage] = useState(""),
    [open, setOpen] = useState(false);
  return (
    <div className="stack">
      <Button onClick={() => setOpen(true)}>Import CSV</Button>
      <CsvImporter
        open={open}
        onOpenChange={setOpen}
        maxFileSize={5 * 1024 * 1024}
        schema={{
          columns: [
            { key: "name", label: "Name", required: true },
            { key: "email", label: "Email" },
          ],
        }}
        onImport={(event) =>
          setMessage(
            `Imported ${event.summary.totalRows} rows in this preview.`,
          )
        }
      />
      <p role="status" className="small muted">
        {message}
      </p>
    </div>
  );
}
export function NavigationExample() {
  return (
    <div className="demo-card stack">
      <h3>Workspace navigation</h3>
      <Link to="/page/collection">Orders</Link>
      <Link to="/page/simple-master-crud">Suppliers</Link>
      <Link to="/page/dashboard-with-charts">Reports</Link>
    </div>
  );
}
export function Foundation() {
  return (
    <div className="stack">
      <h2>Color</h2>
      <div className="swatches">
        {[
          "background",
          "foreground",
          "primary",
          "secondary",
          "muted",
          "accent",
          "border",
          "destructive",
        ].map((name) => (
          <div key={name}>
            <span style={{ background: `var(--${name})` }} />
            <code>{name}</code>
          </div>
        ))}
      </div>
      <h2>Typography</h2>
      {[32, 24, 20, 16, 14, 12].map((size) => (
        <p key={size} style={{ fontSize: size }}>
          {size}px — The quick brown fox / ERPboostの業務画面
        </p>
      ))}
      <h2>Spacing</h2>
      <div className="row wrap">
        {[4, 8, 12, 16, 24, 32].map((size) => (
          <div key={size} className="demo-card">
            <span
              style={{
                display: "block",
                width: size,
                height: size,
                background: "var(--primary)",
                marginBottom: 8,
              }}
            />
            {size}px
          </div>
        ))}
      </div>
    </div>
  );
}
export function LocaleExample() {
  const { t } = useLocale();
  return (
    <div className="demo-card stack">
      <h3>{t("Application shell", "アプリケーション枠")}</h3>
      <p>
        {t(
          "This catalogue uses the same navigation, theme and command palette components maintained in this repository.",
          "このカタログは、同じリポジトリで管理するナビゲーション・テーマ・コマンドパレットを使用しています。",
        )}
      </p>
      <NavigationExample />
    </div>
  );
}
