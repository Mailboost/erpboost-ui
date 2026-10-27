import { ComponentLanguage, Translated } from "./shared/component-language";
import { Foundation, SidebarDocs } from "./documentation";
import { useState, type ReactNode } from "react";
import {
  ActionPanel,
  ActivityCard,
  Alert,
  Attachment,
  useAttachment,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Combobox,
  CsvImporter,
  useCsvImporter,
  csv,
  DataTable,
  useDataTable,
  createColumnHelper,
  DateField,
  DatePicker,
  DescriptionCard,
  Dialog,
  Field,
  Fieldset,
  Form,
  Input,
  Layout,
  Link,
  Menu,
  MetricCard,
  Select,
  Sheet,
  SidebarGroup,
  SidebarItem,
  SidebarSeparator,
  Table,
  Tabs,
  Tooltip,
  parseDate,
} from "@mailboost/erpboost-ui";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Star,
  Sparkles,
  Rocket,
} from "lucide-react";
import { getDayOfWeek } from "@internationalized/date";
import { entries } from "../registry";
import meta from "./metadata.json";
const members = ["Tanaka", "Sato", "Suzuki", "Yamada"];
function DocCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Translated>
      <Card.Root>
        <Card.Header title={title} description={description} />
        {children && <Card.Content>{children}</Card.Content>}
      </Card.Root>
    </Translated>
  );
}
function Composition({ slug }: { slug: string }) {
  return (
    <DocCard
      title="Composition Level Component"
      description="This export is used at the application shell level rather than as a leaf widget."
    >
      <div className="space-y-3 text-sm">
        <p>
          {
            (meta as Record<string, { description: string }>)[
              `/components/${slug}`
            ].description
          }
        </p>
        <p className="text-sm text-muted-foreground">
          This catalogue also uses it at the application root.
        </p>
      </div>
    </DocCard>
  );
}
export function Overview() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DocCard
        title="Sidebar Resources"
        description="UI components are exposed as individual resources."
      >
        <div className="flex flex-wrap gap-2">
          {entries
            .filter((e) => e.category === "components")
            .map((e) => (
              <Badge variant="outline-neutral" key={e.slug}>
                {e.title}
              </Badge>
            ))}
        </div>
      </DocCard>
      <DocCard
        title="App-Level Components"
        description="These are composed at the application root."
      >
        <div className="flex flex-wrap gap-2">
          {[
            "AppShell",
            "DefaultSidebar",
            "SidebarLayout",
            "CommandPalette",
            "AuthProvider",
            "WithGuard",
          ].map((s) => (
            <Badge variant="outline-info" key={s}>
              {s}
            </Badge>
          ))}
        </div>
      </DocCard>
    </div>
  );
}
function ButtonDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
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
          <Button variant={variant} key={variant}>
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
      <div className="flex flex-wrap items-center gap-3">
        {(["xs", "sm", "default", "lg"] as const).map((size, i) => (
          <Button size={size} key={size}>
            {["XS", "SM", "Default", "LG"][i]}
          </Button>
        ))}
        <Button size="icon" aria-label="+">
          +
        </Button>
      </div>
    </div>
  );
}
function BadgeDemo() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          ["default", "success", "warning", "error", "info", "neutral"],
          ["subtle-success", "subtle-warning", "subtle-error", "subtle-info"],
          [
            "outline-success",
            "outline-warning",
            "outline-error",
            "outline-info",
            "outline-neutral",
          ],
        ].map((row, i) => (
          <div className="flex flex-wrap gap-3" key={i}>
            {row.map((v) => (
              <Badge key={v} variant={v as "default"}>
                {v
                  .split("-")
                  .map((s) => s[0].toUpperCase() + s.slice(1))
                  .join(" ")}
              </Badge>
            ))}
          </div>
        ))}
      </div>
      <DocCard
        title="With icon"
        description="Badge only renders children, so any icon can be placed freely inside it."
      >
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" className="gap-1">
            <Sparkles className="size-3" />
            New
          </Badge>
          <Badge variant="info" className="gap-1">
            <Rocket className="size-3" />
            Beta
          </Badge>
          <Badge variant="outline-warning">
            <Star className="size-3" />
            Featured
          </Badge>
        </div>
      </DocCard>
      <DocCard
        title="With trailing chevron"
        description="Not a distinct variant — pair a Badge with a chevron icon (e.g. as a Menu trigger) to signal it opens a menu."
      >
        <div className="flex gap-3">
          <Badge variant="neutral" className="gap-1">
            In Review
            <ChevronDown className="size-3" />
          </Badge>
          <Badge variant="outline-neutral">
            Assignee
            <ChevronDown className="size-3" />
          </Badge>
        </div>
      </DocCard>
    </div>
  );
}
function AlertDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-4 md:max-w-2xl">
      {[
        [
          "info",
          "Sync scheduled",
          "ERP master data will sync at 02:00 JST tonight.",
        ],
        [
          "success",
          "Supplier approved",
          "Tailor Supply Co. is now active in production.",
        ],
        [
          "warning",
          "Review pending",
          "Three requests are waiting for your approval.",
        ],
        [
          "error",
          "Sync failed",
          "The last import could not reach the ERP endpoint.",
        ],
      ].map(([v, title, body]) => (
        <Alert.Root key={v} variant={v as "info"}>
          <Alert.Title>{title}</Alert.Title>
          <Alert.Description>{body}</Alert.Description>
        </Alert.Root>
      ))}
      {open && (
        <Alert.Root dismissible onDismiss={() => setOpen(false)}>
          <Alert.Title>Heads up</Alert.Title>
          <Alert.Description>
            This is a neutral, dismissible note.
          </Alert.Description>
        </Alert.Root>
      )}
    </div>
  );
}
function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      {["SM", "TS", "AB"].map((s, i) => (
        <Avatar.Root size={(["sm", "default", "lg"] as const)[i]} key={s}>
          <Avatar.Fallback>{s}</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </div>
  );
}
function ActivityDemo() {
  const now = Date.now();
  return (
    <ActivityCard
      title="Recent updates"
      groupBy="day"
      items={[
        {
          id: "1",
          actor: { name: "Aiko Sato" },
          description: "approved the supplier profile update",
          timestamp: new Date(now),
        },
        {
          id: "2",
          actor: { name: "System" },
          description: "synced company master data",
          timestamp: new Date(now - 10800000),
        },
        {
          id: "3",
          actor: { name: "Taro Tanaka" },
          description: "submitted a revision request",
          timestamp: new Date(now - 93600000),
        },
      ]}
    />
  );
}
function ActionDemo() {
  return (
    <ActionPanel
      title="Procurement Actions"
      actions={[
        {
          key: "approve",
          label: "Approve request",
          icon: <span>A</span>,
          onClick: () => {},
        },
        {
          key: "comment",
          label: "Leave comment",
          icon: <span>C</span>,
          onClick: () => {},
        },
        {
          key: "sync",
          label: "Sync ERP",
          icon: <Check />,
          disabled: true,
          onClick: () => {},
        },
      ]}
    />
  );
}
function AttachmentsDemo() {
  const attachment = useAttachment({
    initialItems: [
      {
        id: "tax",
        fileName: "supplier-tax-cert.pdf",
        mimeType: "application/pdf",
      },
      {
        id: "logo",
        fileName: "logo.png",
        mimeType: "image/png",
        previewUrl:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%2300b3a4'/><text x='20' y='25' text-anchor='middle' font-family='monospace' font-size='14' fill='white'>UI</text></svg>",
      },
    ],
  });
  return (
    <Card.Root>
      <Card.Content>
        <Attachment
          {...attachment.props}
          uploadLabel="Drop files or click to upload"
          uploadHint="Images and PDF up to 20MB."
        />
      </Card.Content>
    </Card.Root>
  );
}
function CalendarDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DocCard
        title="Basic"
        description="Uncontrolled month grid with a selected value."
      >
        <Calendar
          defaultValue={parseDate("2026-07-10")}
          aria-label="Select a date"
        />
      </DocCard>
      <DocCard
        title="Constraints"
        description="minValue / maxValue bound the range, isDateUnavailable disables weekends, and firstDayOfWeek starts the week on Monday."
      >
        <Calendar
          defaultValue={parseDate("2026-07-15")}
          minValue={parseDate("2026-07-01")}
          maxValue={parseDate("2026-07-31")}
          firstDayOfWeek="mon"
          isDateUnavailable={(d) => [0, 6].includes(getDayOfWeek(d, "en-US"))}
          aria-label="Select a business day in July"
        />
      </DocCard>
    </div>
  );
}
function Dates({ picker = false }: { picker?: boolean }) {
  const Control = picker ? DatePicker : DateField;
  const fields = picker
    ? [
        { label: "Ship date", value: "2026-07-10" },
        {
          label: "Delivery window",
          constrained: true,
          description: "Constrained to the next 30 days.",
        },
        {
          label: "Booking slot",
          minute: true,
          description: "Minute granularity opens a time-capable calendar.",
        },
        { label: "Locked ship date", value: "2026-07-10", readOnly: true },
      ]
    : [
        { label: "Invoice date", value: "2026-07-10" },
        { label: "Due date", description: "Optional, defaults to net-30." },
        {
          label: "Meeting starts",
          minute: true,
          description: "Minute granularity shows an hour/minute segment too.",
        },
        { label: "Fiscal year end", invalid: true },
        { label: "Locked date", value: "2026-01-01", disabled: true },
      ];
  return (
    <div className="grid gap-4 md:max-w-xs">
      {fields.map((f) => (
        <Field.Root
          key={f.label}
          invalid={"invalid" in f && f.invalid}
          disabled={"disabled" in f && f.disabled}
        >
          <Field.Label>{f.label}</Field.Label>
          <Control
            className="w-full"
            aria-label={f.label}
            minValue={"constrained" in f ? parseDate("2026-07-10") : undefined}
            maxValue={
              "constrained" in f
                ? parseDate("2026-07-10").add({ days: 30 })
                : undefined
            }
            defaultValue={f.value ? parseDate(f.value) : undefined}
            granularity={f.minute ? "minute" : "day"}
            isReadOnly={"readOnly" in f && f.readOnly}
          />
          {f.description && (
            <Field.Description className="self-stretch">
              {f.description}
            </Field.Description>
          )}
          {"invalid" in f && f.invalid && (
            <p
              role="alert"
              className="self-stretch text-sm font-medium text-destructive"
            >
              This field is required.
            </p>
          )}
        </Field.Root>
      ))}
    </div>
  );
}
function SelectDemo({ combo = false }: { combo?: boolean }) {
  return (
    <div className="grid gap-4 md:max-w-xl">
      {combo ? (
        <>
          <Combobox
            items={members}
            defaultValue="Tanaka"
            aria-label="Assign owner"
            placeholder="Assign owner"
          />
          <Combobox
            multiple
            items={members}
            defaultValue={["Tanaka", "Sato"]}
          />
        </>
      ) : (
        <>
          <Select
            items={["Draft", "In Review", "Approved"]}
            defaultValue="Draft"
          />
          <Select
            multiple
            items={["Draft", "In Review", "Approved"]}
            defaultValue={["Draft", "Approved"]}
          />
        </>
      )}
    </div>
  );
}
function FormDemo() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );
  return (
    <Form
      className="space-y-6 md:max-w-2xl"
      onFormSubmit={(values) => setSubmitted(values)}
    >
      <Fieldset.Root className="space-y-4">
        <Fieldset.Legend>Supplier Profile</Fieldset.Legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field.Root name="companyName">
            <Field.Label>Company Name</Field.Label>
            <Field.Control placeholder="Tailor Supply Co." required />
            <Field.Description>
              Displayed on the supplier portal.
            </Field.Description>
          </Field.Root>
          <Field.Root name="contactEmail">
            <Field.Label>Contact Email</Field.Label>
            <Field.Control
              type="email"
              placeholder="ops@example.com"
              required
            />
          </Field.Root>
        </div>
        <Button type="submit">Submit form</Button>
      </Fieldset.Root>
      {submitted && (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </Form>
  );
}
function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Open dialog
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Confirm update</Dialog.Title>
          <Dialog.Description>
            Apply the supplier master changes to production.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close render={<Button />}>Close</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
function MenuDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>
        Open menu
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Group>
          <Menu.GroupLabel>Actions</Menu.GroupLabel>
          <Menu.Item>Approve</Menu.Item>
          <Menu.Item>Reject</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.CheckboxItem defaultChecked>Notify requester</Menu.CheckboxItem>
        <Menu.CheckboxItem>Auto approve next time</Menu.CheckboxItem>
      </Menu.Content>
    </Menu.Root>
  );
}
function SheetDemo() {
  return (
    <Sheet.Root>
      <Sheet.Trigger render={<Button variant="outline" />}>
        Open sheet
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Approval detail</Sheet.Title>
          <Sheet.Description>
            Side panel for dense review workflows.
          </Sheet.Description>
        </Sheet.Header>
      </Sheet.Content>
    </Sheet.Root>
  );
}
const cols = createColumnHelper<{
  supplier: string;
  owner: string;
  status: string;
}>();
const supplierColumns = [
  cols.column({ id: "supplier", label: "Supplier", type: "text" }),
  cols.column({ id: "owner", label: "Owner", type: "text" }),
  cols.column({
    id: "status",
    label: "Status",
    render: (row) => (
      <Badge
        variant={
          row.status === "Approved"
            ? "success"
            : row.status === "Rejected"
              ? "error"
              : "warning"
        }
      >
        {row.status}
      </Badge>
    ),
  }),
];
function SupplierData({
  rows,
}: {
  rows: { supplier: string; owner: string; status: string }[];
}) {
  const table = useDataTable({ data: { rows }, columns: supplierColumns });
  return (
    <DataTable.Root value={table}>
      <DataTable.Table />
    </DataTable.Root>
  );
}
function DataTableDemo() {
  return (
    <div className="space-y-8">
      <SupplierData
        rows={[
          ["Tailor Supply Co.", "Tanaka", "Pending"],
          ["East Works Ltd.", "Sato", "Pending"],
          ["Northwind Materials", "Suzuki", "Approved"],
          ["Acme Components", "Yamada", "Rejected"],
        ].map(([supplier, owner, status]) => ({ supplier, owner, status }))}
      />
      <DocCard
        title="Fill layout"
        description="Inside a Layout fill, DataTable scrolls internally so the page title and toolbar stay pinned above the rows."
      >
        <div className="h-72 overflow-hidden">
          <Layout fill className="h-full">
            <Layout.Header title="Suppliers" />
            <Layout.Column className="overflow-y-auto">
              <SupplierData
                rows={Array.from({ length: 24 }, (_, i) => ({
                  supplier: `Supplier ${i + 1}`,
                  owner: members[i % 4],
                  status: ["Pending", "Approved", "Rejected"][i % 3],
                }))}
              />
            </Layout.Column>
          </Layout>
        </div>
      </DocCard>
      <DocCard
        title="Empty state"
        description="The empty/error state height is now capped at 5 rows instead of reserving pageSize-worth of height, so large page sizes no longer leave a huge blank region."
      >
        <SupplierData rows={[]} />
      </DocCard>
    </div>
  );
}
function TableDemo() {
  return (
    <Table.Root>
      <Table.Caption>Supplier approval queue</Table.Caption>
      <Table.Header>
        <Table.Row>
          {["Supplier", "Status", "Owner"].map((s) => (
            <Table.Head key={s}>{s}</Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {[
          ["Tailor Supply Co.", "Approved", "Tanaka"],
          ["East Works Ltd.", "Review", "Sato"],
        ].map((row) => (
          <Table.Row key={row[0]}>
            {row.map((s, i) => (
              <Table.Cell key={s}>
                {i === 1 ? (
                  <Badge variant={s === "Approved" ? "success" : "warning"}>
                    {s}
                  </Badge>
                ) : (
                  s
                )}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
function TabsDemo() {
  return (
    <div className="space-y-6 md:max-w-2xl">
      {(["default", "line", "capsule"] as const).map((variant, i) => (
        <DocCard
          key={variant}
          title={["Default", "Line", "Capsule"][i]}
          description={
            [
              "Subtle segmented control.",
              "Underlined tabs for page-level sections.",
              "Pill-in-a-track filter switcher.",
            ][i]
          }
        >
          <Tabs.Root defaultValue="0" variant={variant}>
            <Tabs.List
              aria-label={
                i === 2
                  ? "Order status"
                  : i === 1
                    ? "Supplier sections (line)"
                    : "Supplier sections"
              }
            >
              {(i === 2
                ? ["All", "Pending", "Approved"]
                : ["Overview", "Orders", "Activity"]
              ).map((s, j) => (
                <Tabs.Tab value={String(j)} key={s}>
                  {s}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {i === 0 &&
              [
                "Company profile and key metrics.",
                "Purchase orders and recent activity.",
                "Latest supplier updates.",
              ].map((s, j) => (
                <Tabs.Panel value={String(j)} key={s} className="pt-3 text-sm">
                  {s}
                </Tabs.Panel>
              ))}
          </Tabs.Root>
        </DocCard>
      ))}
      <DocCard
        title="Icon-only"
        description="A capsule tab whose only child is an icon renders square instead of wider-than-tall."
      >
        <Tabs.Root variant="capsule" defaultValue="grid">
          <Tabs.List aria-label="View mode">
            {[
              ["grid", LayoutGrid],
              ["list", List],
              ["favorites", Star],
            ].map(([s, Icon]) => {
              const C = Icon as typeof Star;
              return (
                <Tabs.Tab
                  value={s as string}
                  aria-label={`${String(s)[0].toUpperCase() + String(s).slice(1)} view`}
                  key={String(s)}
                >
                  <C className="size-4" />
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs.Root>
      </DocCard>
      <DocCard
        title="Sizes"
        description="xs / sm / default / lg set a minimum height on the capsule variant to align with Button. An icon-only tab renders square."
      >
        <div className="space-y-4">
          {(["xs", "sm", "default", "lg"] as const).map((size) => (
            <div className="flex items-center gap-3" key={size}>
              <span className="w-14 shrink-0 text-xs text-muted-foreground">
                {size}
              </span>
              <Tabs.Root variant="capsule" size={size} defaultValue="all">
                <Tabs.List aria-label={`Order status (${size})`}>
                  <Tabs.Tab value="all">All</Tabs.Tab>
                  <Tabs.Tab value="pending">Pending</Tabs.Tab>
                  <Tabs.Tab value="favorites" aria-label="Favorites">
                    <Star className="size-4" />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.Root>
            </div>
          ))}
        </div>
      </DocCard>
    </div>
  );
}
function LayoutDemo() {
  return (
    <div className="space-y-8">
      <Layout>
        <Layout.Column area="left">
          <div className="rounded-xl bg-muted p-4">Left rail</div>
        </Layout.Column>
        <Layout.Column area="main">
          <div className="rounded-xl bg-muted p-4">Main content</div>
        </Layout.Column>
        <Layout.Column area="right">
          <div className="rounded-xl bg-muted p-4">Right rail</div>
        </Layout.Column>
      </Layout>
      <DocCard
        title="Fill"
        description="With fill, Layout.Header stays pinned and only the column body scrolls — instead of the whole page growing and scrolling."
      >
        <div className="h-80 overflow-hidden rounded-xl border">
          <Layout fill className="h-full">
            <Layout.Header
              title="Products"
              actions={[
                <Button key="create" size="sm">
                  Create
                </Button>,
              ]}
            />
            <Layout.Column className="overflow-y-auto">
              <div className="space-y-2 p-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div className="rounded-md bg-muted p-3 text-sm" key={i}>
                    Row {i + 1}
                  </div>
                ))}
              </div>
            </Layout.Column>
          </Layout>
        </div>
      </DocCard>
    </div>
  );
}
function CsvDemo() {
  const importer = useCsvImporter({
    schema: {
      columns: [
        {
          key: "name",
          label: "Supplier name",
          required: true,
          schema: csv.string({ min: 1 }),
        },
        { key: "owner", label: "Owner", schema: csv.string() },
        {
          key: "status",
          label: "Status",
          schema: csv.enum(["pending", "approved", "rejected"]),
        },
      ],
    },
    onImport: async () => {},
  });
  return (
    <>
      <Button onClick={importer.open}>Import suppliers from CSV</Button>
      <CsvImporter {...importer.props} />
    </>
  );
}
function CollectionDoc() {
  return (
    <DocCard
      title="How it composes"
      description="Wrap DataTable.Root with this provider when you need DataTable.Filters or DataTable.Pagination."
    >
      <p className="mb-2 text-sm">
        control is obtained from useCollectionVariables() and passed to both
        this provider and useDataTable.
      </p>
      <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
        {
          "<CollectionControlProvider value={control}>\n  <DataTable.Root value={table}>\n    <DataTable.Filters />\n    <DataTable.Table />\n    <DataTable.Footer>\n      <DataTable.Pagination />\n    </DataTable.Footer>\n  </DataTable.Root>\n</CollectionControlProvider>"
        }
      </pre>
    </DocCard>
  );
}
function ReferenceComponentBody({ slug }: { slug: string }) {
  switch (slug) {
    case "overview":
      return <Overview />;
    case "foundation":
      return <Foundation />;
    case "sidebar":
      return <SidebarDocs />;
    case "button":
      return <ButtonDemo />;
    case "badge":
      return <BadgeDemo />;
    case "alert":
      return <AlertDemo />;
    case "avatar":
      return <AvatarDemo />;
    case "activity-card":
      return <ActivityDemo />;
    case "action-panel":
      return <ActionDemo />;
    case "attachment":
      return <AttachmentsDemo />;
    case "app-shell":
    case "auth-provider":
    case "command-palette":
    case "with-guard":
      return <Composition slug={slug} />;
    case "autocomplete":
      return (
        <div className="md:max-w-xl">
          <Autocomplete
            items={members}
            defaultValue="Ta"
            aria-label="Type a member name"
            placeholder="Type a member name"
          />
        </div>
      );
    case "card":
      return (
        <Card.Root>
          <Card.Header
            title="Supplier Summary"
            description="Basic card composition"
          />
          <Card.Content>
            <div className="space-y-2">
              <p>Tailor Supply Co.</p>
              <p className="text-sm text-muted-foreground">
                Last updated: 2026-04-01
              </p>
            </div>
          </Card.Content>
        </Card.Root>
      );
    case "calendar":
      return <CalendarDemo />;
    case "collection-control-provider":
      return <CollectionDoc />;
    case "combobox":
      return <SelectDemo combo />;
    case "csv-importer":
      return <CsvDemo />;
    case "data-table":
      return <DataTableDemo />;
    case "date-field":
      return <Dates />;
    case "date-picker":
      return <Dates picker />;
    case "description-card":
      return (
        <DescriptionCard
          title="Supplier Summary"
          data={{
            name: "Tailor Supply Co.",
            status: "Approved",
            requestedAt: "2026-04-01",
            website: "https://tailor.tech",
          }}
          fields={[
            { key: "name", label: "Company Name" },
            {
              key: "status",
              label: "Status",
              type: "badge",
              meta: { badgeVariantMap: { Approved: "success" } },
            },
            { type: "divider" },
            { key: "requestedAt", label: "Requested At", type: "date" },
            { key: "website", label: "Website", type: "link" },
          ]}
        />
      );
    case "dialog":
      return <DialogDemo />;
    case "field":
      return (
        <Field.Root className="md:max-w-xl">
          <Field.Label>Email</Field.Label>
          <Field.Control type="email" placeholder="buyer@tailor.tech" />
          <Field.Description>
            We will use this for approval notifications.
          </Field.Description>
        </Field.Root>
      );
    case "fieldset":
      return (
        <Fieldset.Root className="space-y-4 md:max-w-2xl">
          <Fieldset.Legend>Billing details</Fieldset.Legend>
          <div className="grid gap-4 md:grid-cols-2">
            <Field.Root>
              <Field.Label>Company</Field.Label>
              <Field.Control placeholder="Tailor Supply Co." />
            </Field.Root>
            <Field.Root>
              <Field.Label>Tax ID</Field.Label>
              <Field.Control placeholder="JP-123456" />
            </Field.Root>
          </div>
        </Fieldset.Root>
      );
    case "form":
      return <FormDemo />;
    case "input":
      return (
        <div className="grid gap-4 md:max-w-xl">
          <Input placeholder="Search suppliers" />
          <Input type="email" defaultValue="buyer@tailor.tech" />
        </div>
      );
    case "layout":
      return <LayoutDemo />;
    case "link":
      return (
        <div className="flex flex-col gap-3">
          <Link to="/components/button">Go to Button page</Link>
          <Link to="/components/table">Go to Table page</Link>
        </div>
      );
    case "menu":
      return <MenuDemo />;
    case "metric-card":
      return (
        <MetricCard
          icon={<span>O</span>}
          title="Monthly Savings"
          value="JPY 1,240,000"
          trend={{ direction: "up", value: "+12.4%" }}
          description="vs previous month"
        />
      );
    case "select":
      return <SelectDemo />;
    case "sheet":
      return <SheetDemo />;
    case "table":
      return <TableDemo />;
    case "tabs":
      return <TabsDemo />;
    case "tooltip":
      return (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger render={<Button variant="outline" />}>
              Hover tooltip
            </Tooltip.Trigger>
            <Tooltip.Content>
              Supplier data is synced every night.
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    default:
      return null;
  }
}

export function ReferenceComponent({ slug }: { slug: string }) {
  return (
    <ComponentLanguage slug={slug}>
      <ReferenceComponentBody slug={slug} />
    </ComponentLanguage>
  );
}
