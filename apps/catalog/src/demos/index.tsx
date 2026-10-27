import { createElement, lazy, type ComponentType } from "react";
import type { Entry } from "../registry";
const ownModules = {
  components: () => import("./components"),
  workspace: () => import("./workspace"),
  patterns: () => import("./patterns"),
  forms: () => import("./forms"),
  wizard: () => import("../examples/patterns/form-wizard"),
};
function load(
  file: keyof typeof ownModules,
  name: string,
  props: Record<string, unknown> = {},
): ComponentType {
  return lazy(async () => {
    const module = await ownModules[file]();
    const Component = (
      module as unknown as Record<
        string,
        ComponentType<Record<string, unknown>>
      >
    )[name];
    if (!Component) throw new Error(`Unknown preview ${file}/${name}`);
    return { default: () => createElement(Component, props) };
  });
}
const exampleModules = import.meta.glob(
  "../examples/components/*.tsx",
) as Record<string, () => Promise<Record<string, ComponentType>>>;
const exampleSources = import.meta.glob("../examples/components/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const ownSources = import.meta.glob("./*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const wizardSource = import.meta.glob("../examples/patterns/form-wizard.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const customComponents: Record<string, ComponentType> = {
  foundation: load("components", "Foundation"),
  "action-panel": load("components", "ActionPanelExample"),
  attachment: load("components", "AttachmentExample"),
  "app-shell": load("components", "LocaleExample"),
  "auth-provider": load("components", "AuthExample"),
  button: load("components", "ButtonExamples"),
  calendar: load("components", "CalendarExample"),
  "collection-control-provider": load("components", "CollectionControlExample"),
  "command-palette": load("components", "CommandExample"),
  "csv-importer": load("components", "CsvExample"),
  "date-field": load("components", "DateExample"),
  "date-picker": load("components", "DateExample", { picker: true }),
  field: load("components", "FormExample"),
  fieldset: load("components", "FormExample"),
  form: load("components", "FormExample"),
  link: load("components", "NavigationExample"),
  sidebar: load("components", "NavigationExample"),
  "with-guard": load("components", "GuardExample"),
};
const pages: Record<string, ComponentType> = {
  "assistant-panel": load("patterns", "AssistantPage"),
  chat: load("patterns", "ChatPage"),
  collection: load("workspace", "Collection"),
  "dashboard-with-charts": load("workspace", "Dashboard"),
  "detail-2col-action-panel": load("workspace", "RecordDetails"),
  "document-page": load("forms", "DocumentPage"),
  email: load("patterns", "EmailPage"),
  "form-as-page": load("forms", "FullPageForm"),
  "pipeline-kanban": load("patterns", "Kanban"),
  "simple-master-crud": load("workspace", "MasterList"),
};
const patterns: Record<string, ComponentType> = {
  "ai-chat": load("patterns", "Conversation", { assistant: true }),
  "approval-flow": load("patterns", "Approval"),
  "approval-route-builder": load("patterns", "Approval", { builder: true }),
  "bulk-actions-bar": load("patterns", "BulkActions"),
  "conversation-thread": load("patterns", "Conversation"),
  "data-charts": load("workspace", "Charts"),
  "datatable-inline-edit": load("workspace", "Collection", { inline: true }),
  "field-diff-table": load("patterns", "FieldDiff"),
  "form-builder": load("forms", "FormBuilder"),
  "grid-view": load("workspace", "Collection", { grid: true }),
  "multi-step-form": load("wizard", "FormWizard"),
  "notification-panel": load("patterns", "Notifications"),
  "pipeline-stage-manager": load("patterns", "Kanban", { manager: true }),
  "rich-text-editor": load("forms", "RichTextEditor"),
  "right-sheet-custom": load("patterns", "RightSheet"),
  "supplier-cascader": load("patterns", "SupplierCascader"),
  "thread-composer": load("patterns", "Conversation", { composerOnly: true }),
  timeline: load("patterns", "Timeline"),
  "user-profile-dialog": load("patterns", "ProfileDialog"),
};
export interface Demo {
  name: string;
  Component: ComponentType;
  source: string;
}
export function getDemos(entry: Entry): Demo[] {
  if (entry.category === "components") {
    const custom = customComponents[entry.slug];
    if (custom)
      return [
        {
          name: "Basic usage",
          Component: custom,
          source: ownSources["./components.tsx"],
        },
      ];
    const key = `../examples/components/${entry.slug}.tsx`,
      mod = exampleModules[key];
    if (mod)
      return [...exampleSources[key].matchAll(/export function (\w+)/g)].map(
        (match) => {
          const name = match[1];
          return {
            name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
            Component: lazy(async () => ({ default: (await mod())[name] })),
            source: exampleSources[key],
          };
        },
      );
  }
  if (entry.category === "page" && entry.slug === "collection")
    return [
      {
        name: "Read-only (browse-first collection)",
        Component: load("workspace", "Collection"),
        source: ownSources["./workspace.tsx"],
      },
      {
        name: "Inline edit (edit values directly in the list)",
        Component: load("workspace", "Collection", { inline: true }),
        source: ownSources["./workspace.tsx"],
      },
      {
        name: "Grid / List toggle (for thumbnail-heavy catalogs)",
        Component: load("workspace", "Collection", { grid: true }),
        source: ownSources["./workspace.tsx"],
      },
    ];
  const Component =
    entry.category === "page" ? pages[entry.slug] : patterns[entry.slug];
  const file =
    entry.slug === "multi-step-form"
      ? null
      : [
            "document-page",
            "form-as-page",
            "form-builder",
            "rich-text-editor",
          ].includes(entry.slug)
        ? "forms"
        : [
              "collection",
              "dashboard-with-charts",
              "detail-2col-action-panel",
              "simple-master-crud",
              "data-charts",
              "grid-view",
              "datatable-inline-edit",
            ].includes(entry.slug)
          ? "workspace"
          : "patterns";
  if (Component)
    return [
      {
        name: "Basic usage",
        Component,
        source: file
          ? ownSources[`./${file}.tsx`]
          : Object.values(wizardSource)[0],
      },
    ];
  return [];
}
