import referenceMetadata from "./reference/metadata.json" with { type: "json" };
import tailorRoutes from "./reference/tailor-routes.json" with { type: "json" };
// The reference snapshot keeps newly registered ERPBoost entries marked by default.
const tailorPaths = new Set(tailorRoutes);
export type Category = "components" | "page" | "patterns";
export interface Entry {
  origin: "tailor" | "erpboost";
  slug: string;
  title: string;
  ja: string;
  description: string;
  descriptionJa?: string;
  category: Category;
  blockPreview?: boolean;
  tags?: string[];
  size?: string;
  tier?: string;
  markdownFiles?: string[];
  markdownNotes?: string;
  markdownNotesJa?: string;
  guidance?: { do: [string, string]; dont: [string, string] };
  primitives?: string[];
}
const groups: Record<Category, Array<[string, string, string, string]>> = {
  components: [
    [
      "overview",
      "Overview",
      "概要",
      "Explore the building blocks of ERPboost applications.",
    ],
    [
      "foundation",
      "Foundation",
      "デザインの基礎",
      "Color, typography, spacing and semantic tokens.",
    ],
    [
      "action-panel",
      "ActionPanel",
      "アクションパネル",
      "Contextual actions grouped in a compact panel.",
    ],
    [
      "activity-card",
      "ActivityCard",
      "アクティビティ",
      "Show a chronological record of changes and comments.",
    ],
    [
      "alert",
      "Alert",
      "アラート",
      "Present information, success, warning and error states.",
    ],
    [
      "attachment",
      "Attachment",
      "添付ファイル",
      "Select, preview and manage file attachments.",
    ],
    [
      "app-shell",
      "AppShell",
      "アプリケーション枠",
      "Application routing, navigation and shared context.",
    ],
    [
      "auth-provider",
      "AuthProvider",
      "認証プロバイダー",
      "Present authenticated and unauthenticated UI states.",
    ],
    [
      "autocomplete",
      "Autocomplete",
      "オートコンプリート",
      "Offer suggestions while a user types.",
    ],
    [
      "avatar",
      "Avatar",
      "アバター",
      "Represent people with an image or initials.",
    ],
    [
      "badge",
      "Badge",
      "バッジ",
      "Communicate status and category at a glance.",
    ],
    [
      "button",
      "Button",
      "ボタン",
      "Preview the main button variants and sizes.",
    ],
    [
      "calendar",
      "Calendar",
      "カレンダー",
      "Choose a date from an accessible calendar.",
    ],
    [
      "card",
      "Card",
      "カード",
      "Group related content with a header and optional footer.",
    ],
    [
      "collection-control-provider",
      "CollectionControlProvider",
      "一覧の状態管理",
      "Share search, filtering and selection state.",
    ],
    [
      "combobox",
      "Combobox",
      "コンボボックス",
      "Search and select a value from a list.",
    ],
    [
      "command-palette",
      "CommandPalette",
      "コマンドパレット",
      "Navigate and discover actions with the keyboard.",
    ],
    [
      "csv-importer",
      "CsvImporter",
      "CSV取込",
      "Map columns, validate rows and import a CSV file.",
    ],
    [
      "data-table",
      "DataTable",
      "データテーブル",
      "Display structured data with sorting, selection and editing.",
    ],
    [
      "date-field",
      "DateField",
      "日付入力",
      "Enter a date with segmented keyboard controls.",
    ],
    [
      "date-picker",
      "DatePicker",
      "日付選択",
      "Select dates using an input and calendar popover.",
    ],
    [
      "description-card",
      "DescriptionCard",
      "詳細情報カード",
      "Display labeled values in a compact read-only layout.",
    ],
    [
      "dialog",
      "Dialog",
      "ダイアログ",
      "Focus attention on a confirmation or short task.",
    ],
    [
      "field",
      "Field",
      "入力項目",
      "Compose a label, input, description and validation message.",
    ],
    [
      "fieldset",
      "Fieldset",
      "入力項目グループ",
      "Group related form fields under a legend.",
    ],
    [
      "form",
      "Form",
      "フォーム",
      "Build accessible forms with validation and submission.",
    ],
    [
      "input",
      "Input",
      "テキスト入力",
      "Single-line text, number and search inputs.",
    ],
    [
      "layout",
      "Layout",
      "レイアウト",
      "Arrange page headings, columns and sections.",
    ],
    ["link", "Link", "リンク", "Navigate between application routes."],
    ["menu", "Menu", "メニュー", "Reveal contextual actions in a dropdown."],
    [
      "metric-card",
      "MetricCard",
      "指標カード",
      "Show a key value with its trend and context.",
    ],
    ["select", "Select", "選択入力", "Choose one option from a dropdown."],
    [
      "sheet",
      "Sheet",
      "サイドパネル",
      "Open a focused detail or editing panel.",
    ],
    [
      "sidebar",
      "Sidebar",
      "サイドバー",
      "Compose grouped and collapsible application navigation.",
    ],
    ["table", "Table", "テーブル", "Render semantic rows and columns."],
    ["tabs", "Tabs", "タブ", "Switch between related content panels."],
    [
      "tooltip",
      "Tooltip",
      "ツールチップ",
      "Explain controls with concise contextual hints.",
    ],
    [
      "with-guard",
      "WithGuard",
      "表示制御",
      "Switch visible content based on application conditions.",
    ],
  ],
  page: [
    [
      "assistant-panel",
      "Assistant panel",
      "アシスタントパネル",
      "A focused workspace with a contextual assistant beside the main content.",
    ],
    [
      "chat",
      "Chat",
      "チャット",
      "A conversation workspace with history and a message composer.",
    ],
    [
      "collection",
      "Collection",
      "一覧画面",
      "A list screen where tabs switch the row set along a discrete axis such as status.",
    ],
    [
      "dashboard-with-charts",
      "Dashboard",
      "ダッシュボード",
      "Key metrics, time-series charts and recent activity in one workspace.",
    ],
    [
      "detail-2col-action-panel",
      "Detail page",
      "詳細画面",
      "A two-column detail layout with contextual actions and an activity trail.",
    ],
    [
      "document-page",
      "Document page (Preview / Edit)",
      "文書のプレビュー・編集",
      "Review a document and switch between preview and editing.",
    ],
    [
      "email",
      "Email",
      "メール",
      "A three-pane email workspace with inbox, message list and conversation.",
    ],
    [
      "form-as-page",
      "Form-as-page",
      "フォーム画面",
      "A full-page form with grouped fields and persistent actions.",
    ],
    [
      "pipeline-kanban",
      "Pipeline Kanban",
      "パイプライン看板",
      "Move work through stages using a board view.",
    ],
    [
      "simple-master-crud",
      "Master list",
      "マスタ一覧",
      "Search, create and edit master records from a compact list.",
    ],
  ],
  patterns: [



    ["editable-grid", "EditableGrid", "編集可能グリッド", "Editable rows with application-owned persistence."],
    ["workflow-graph", "WorkflowGraph", "ワークフローグラフ", "Render dependency graphs from display-only steps."],

    ["context-details", "Context and details", "コンテキストと詳細表示", "Compose a context header, compact sections, template options and a database grid."],
    ["code-workspace", "CodeWorkspace", "コードと実行結果の作業画面", "Compose files, code, results and a graph panel in JSX."],
    ["erp-header", "ERPboost header", "ERPboostヘッダー", "Switch organization and ERP connection in a fixed application header."],
    ["database-workspace", "DatabaseWorkspace", "データベース作業画面", "Browse tables and keep database work in closable tabs."],
    [
      "ai-chat",
      "AI chat",
      "AIチャット",
      "A reusable assistant conversation and composer.",
    ],
    [
      "approval-flow",
      "Approval flow",
      "承認フロー",
      "Show approval steps, decisions and current progress.",
    ],
    [
      "approval-route-builder",
      "Approval route builder",
      "承認経路の設定",
      "Add and reorder approvers before submitting a request.",
    ],
    [
      "bulk-actions-bar",
      "Bulk actions bar",
      "一括操作バー",
      "Offer actions for selected rows without leaving the list.",
    ],
    [
      "conversation-thread",
      "Conversation thread",
      "会話スレッド",
      "Present messages, timestamps and author context.",
    ],
    [
      "data-charts",
      "Charts",
      "グラフ",
      "Compare values and understand change over time.",
    ],
    [
      "datatable-inline-edit",
      "DataTable inline cell edit",
      "セルのインライン編集",
      "Edit individual values directly in the table.",
    ],
    [
      "field-diff-table",
      "Field diff table",
      "項目の変更比較",
      "A table that places proposed changes next to current values so reviewers can decide whether to approve them. Use in approval queues and audit views.",
    ],
    [
      "form-builder",
      "Form builder",
      "フォームビルダー",
      "Add and configure fields with an immediate preview.",
    ],
    [
      "grid-view",
      "Grid view",
      "グリッド表示",
      "Scan a collection as cards with filtering and selection.",
    ],
    [
      "multi-step-form",
      "Multi-step form",
      "ステップ形式の入力",
      "Break a longer task into validated, reversible steps.",
    ],
    [
      "notification-panel",
      "Notification panel",
      "通知パネル",
      "Review unread notifications and mark them as read.",
    ],
    [
      "pipeline-stage-manager",
      "Pipeline stage manager",
      "ステージ管理",
      "Configure the stages used by a pipeline board.",
    ],
    [
      "rich-text-editor",
      "Rich text editor (tiptap)",
      "リッチテキストエディター",
      "Compose formatted content with a focused editing toolbar.",
    ],
    [
      "right-sheet-custom",
      "Right sheet (wide drilldown)",
      "詳細サイドパネル",
      "Explore record details without losing the surrounding list.",
    ],
    [
      "supplier-cascader",
      "Supplier cascader",
      "取引先の階層選択",
      "Narrow supplier choices by region and category.",
    ],
    [
      "thread-composer",
      "Thread composer",
      "メッセージ入力",
      "Write, attach and submit a message in context.",
    ],
    [
      "timeline",
      "Timeline / Gantt",
      "タイムライン・ガント",
      "Compare task schedules across a shared date axis.",
    ],
    [
      "user-profile-dialog",
      "User profile dialog",
      "プロフィール設定",
      "Edit a profile in a compact dialog.",
    ],
  ],
};
export const entries: Entry[] = Object.entries(groups).flatMap(
  ([category, rows]) =>
    rows.map(([slug, title, ja, description]) => ({
      category: category as Category,
      origin: tailorPaths.has(`/${category}/${slug}`) ? "tailor" : "erpboost",
      slug,
      title,
      ja,
      description,
      ...(() => {
        const data = (
          referenceMetadata as Record<
            string,
            {
              description: string;
              do: string;
              dont: string;
              primitives: string[];
              ja?: {
                title?: string;
                paragraphs: string[];
                markdownNotes?: string;
              };
            }
          >
        )[`/${category}/${slug}`];
        return data
          ? {
              ...data,
              ja: data.ja?.title ?? ja,
              descriptionJa: data.ja?.paragraphs[0],
              markdownNotesJa: data.ja?.markdownNotes,
              description: data.description,
              blockPreview: category !== "components",
              ...(category !== "components"
                ? {
                    guidance: {
                      do: [data.do, data.ja?.paragraphs[1] ?? data.do] as [
                        string,
                        string,
                      ],
                      dont: [
                        data.dont,
                        data.ja?.paragraphs[2] ?? data.dont,
                      ] as [string, string],
                    },
                    primitives: data.primitives,
                  }
                : {}),
            }
          : {};
      })(),
    })),
);
export const sections: Array<{
  category: Category;
  title: string;
  ja: string;
  description: string;
  descriptionJa: string;
}> = [
  {
    category: "components",
    title: "Components",
    ja: "コンポーネント",
    description: "Interactive previews of each app-shell primitive.",
    descriptionJa:
      "app-shell が export する各 primitive を対話的に確認できます。",
  },
  {
    category: "page",
    title: "Pages",
    ja: "ページ",
    description:
      "Production-like screens with sidebar chrome and routed page bodies.",
    descriptionJa: "サイドバーやパンくずを含む、実運用に近い画面サンプルです。",
  },
  {
    category: "patterns",
    title: "Patterns",
    ja: "パターン",
    description:
      "Reusable UI slices — panels, editors, mail layouts — composed from primitives.",
    descriptionJa:
      "パネル・エディタ・メールレイアウトなど、primitive を組み立てた再利用単位の UI です。",
  },
];
export const routeOf = (entry: Entry) => `/${entry.category}/${entry.slug}`;
