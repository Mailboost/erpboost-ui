import { createElement, lazy, type ComponentType } from "react";
import type { Entry } from "../registry";
import { SupplierPreviewStateProvider } from "./shared/supplier-preview-state";
import type { Demo } from "../demos";
import { PageFrame } from "./shared/page-frame";
const files = import.meta.glob(
  ["./page__*/**/*.{tsx,ts,css}", "./patterns__*/**/*.{tsx,ts,css}"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const clean = (source: string) =>
  source.startsWith("// Reference example:") ||
  source.startsWith("/* Reference example:")
    ? source.slice(source.indexOf(String.fromCharCode(10)) + 1)
    : source;
const resources: Record<string, Demo[]> = {
  "patterns/editable-grid": [{name:"EditableGrid",description:"Additional presentation composition; existing components are unchanged.",heading:"",screen:false,Component:lazy(async()=>{const m=await import("./patterns__editable-grid/EditableGridDemo");return {default:m.EditableGridDemo};}),source:files["./patterns__editable-grid/EditableGridDemo.tsx"],sources:[{filename:"EditableGridDemo.tsx",markdownFilename:"EditableGridDemo.tsx",source:files["./patterns__editable-grid/EditableGridDemo.tsx"]}]}],
  "patterns/record-panel": [{name:"RecordPanel",description:"Additional presentation composition; existing components are unchanged.",heading:"",screen:false,Component:lazy(async()=>{const m=await import("./patterns__record-panel/RecordPanelDemo");return {default:m.RecordPanelDemo};}),source:files["./patterns__record-panel/RecordPanelDemo.tsx"],sources:[{filename:"RecordPanelDemo.tsx",markdownFilename:"RecordPanelDemo.tsx",source:files["./patterns__record-panel/RecordPanelDemo.tsx"]}]}],
  "patterns/loading-layouts": [{name:"LoadingLayouts",description:"Additional presentation composition; existing components are unchanged.",heading:"",screen:false,Component:lazy(async()=>{const m=await import("./patterns__loading-layouts/LoadingLayoutsDemo");return {default:m.LoadingLayoutsDemo};}),source:files["./patterns__loading-layouts/LoadingLayoutsDemo.tsx"],sources:[{filename:"LoadingLayoutsDemo.tsx",markdownFilename:"LoadingLayoutsDemo.tsx",source:files["./patterns__loading-layouts/LoadingLayoutsDemo.tsx"]}]}],
  "patterns/workflow-graph": [{name:"WorkflowGraph",description:"Additional presentation composition; existing components are unchanged.",heading:"",screen:false,Component:lazy(async()=>{const m=await import("./patterns__workflow-graph/WorkflowGraphDemo");return {default:m.WorkflowGraphDemo};}),source:files["./patterns__workflow-graph/WorkflowGraphDemo.tsx"],sources:[{filename:"WorkflowGraphDemo.tsx",markdownFilename:"WorkflowGraphDemo.tsx",source:files["./patterns__workflow-graph/WorkflowGraphDemo.tsx"]}]}],

  "patterns/context-details": [{name:"Context and details",description:"Additional context header, navigation, search and template choices.",heading:"",screen:false,
    Component:lazy(async()=>{const module=await import("./patterns__context-details/ContextDetailsDemo");return {default:module.ContextDetailsDemo};}),
    source:files["./patterns__context-details/ContextDetailsDemo.tsx"],sources:[{filename:"ContextDetailsDemo.tsx",markdownFilename:"ContextDetailsDemo.tsx",source:files["./patterns__context-details/ContextDetailsDemo.tsx"]}]}],
  "patterns/code-workspace": [{name:"Code workspace",description:"Controlled code/results layout and graph controls.",heading:"",screen:false,
    Component:lazy(async()=>{const module=await import("./patterns__code-workspace/CodeWorkspaceDemo");return {default:module.CodeWorkspaceDemo};}),
    source:files["./patterns__code-workspace/CodeWorkspaceDemo.tsx"],sources:[{filename:"CodeWorkspaceDemo.tsx",markdownFilename:"CodeWorkspaceDemo.tsx",source:files["./patterns__code-workspace/CodeWorkspaceDemo.tsx"]}]},
    {name:"Editor and data surfaces",description:"Files, code, logs and cell editing with controlled state.",heading:"",screen:false,
    Component:lazy(async()=>{const module=await import("./patterns__code-workspace/DeveloperSurfacesDemo");return {default:module.DeveloperSurfacesDemo};}),
    source:files["./patterns__code-workspace/DeveloperSurfacesDemo.tsx"],sources:[{filename:"DeveloperSurfacesDemo.tsx",markdownFilename:"DeveloperSurfacesDemo.tsx",source:files["./patterns__code-workspace/DeveloperSurfacesDemo.tsx"]}]}],
  "patterns/erp-header": [{name:"ERPboost header",description:"Brand, organization, ERP connection and loading states.",heading:"",screen:false,
    Component:lazy(async()=>{const module=await import("./patterns__erp-header/ErpHeaderDemo");return {default:module.ErpHeaderDemo};}),
    source:files["./patterns__erp-header/ErpHeaderDemo.tsx"],sources:[{filename:"ErpHeaderDemo.tsx",markdownFilename:"ErpHeaderDemo.tsx",source:files["./patterns__erp-header/ErpHeaderDemo.tsx"]}]}],
  "patterns/database-workspace": [{
    name: "Database explorer", description: "Controlled table navigation without an AppShell dependency.", heading: "", screen: false,
    Component: lazy(async () => { const module = await import("./patterns__database-workspace/DatabaseWorkspaceDemo"); return {default: module.DatabaseWorkspaceDemo}; }),
    source: files["./patterns__database-workspace/DatabaseWorkspaceDemo.tsx"],
    sources: [{filename:"DatabaseWorkspaceDemo.tsx",markdownFilename:"DatabaseWorkspaceDemo.tsx",source:files["./patterns__database-workspace/DatabaseWorkspaceDemo.tsx"]}],
  }],
  "page/assistant-panel": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__assistant-panel/AssistantPanelScreen");
        return {
          default: () =>
            createElement(PageFrame, {
              fullBleed: true,
              children: createElement(module.AssistantPanelScreen),
            }),
        };
      }),
      source: files["./page__assistant-panel/AssistantPanelScreen.tsx"],
      sources: [
        {
          filename: "AssistantPanelScreen.tsx",
          markdownFilename: "AssistantPanelScreen.tsx",
          source: clean(
            files["./page__assistant-panel/AssistantPanelScreen.tsx"],
          ),
        },
        {
          filename: "AssistantPanel.tsx",
          markdownFilename: "AssistantPanel.tsx",
          source: clean(files["./patterns__ai-chat/AssistantPanel.tsx"]),
        },
        {
          filename: "mockAssistant.ts",
          markdownFilename: "mockAssistant.ts",
          source: clean(files["./patterns__ai-chat/mockAssistant.ts"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.tsx",
          source: clean(files["./page__assistant-panel/App.tsx"]),
        },
      ],
    },
  ],
  "page/chat": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: true,
      Component: lazy(async () => {
        const module = await import("./page__chat/ChatScreen");
        return {
          default: () =>
            createElement(PageFrame, {
              fullBleed: true,
              children: createElement(module.ChatScreen),
            }),
        };
      }),
      source: files["./page__chat/ChatScreen.tsx"],
      sources: [
        {
          filename: "ChatScreen.tsx",
          markdownFilename: "ChatScreen.tsx",
          source: clean(files["./page__chat/ChatScreen.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.tsx",
          source: clean(files["./page__chat/App.tsx"]),
        },
      ],
    },
  ],
  "page/collection": [
    {
      name: "Read-only (browse-first collection)",
      description:
        "Cells are read-only; editing happens on the detail screen. The orthodox list page.",
      heading: "Read-only (browse-first collection)",
      screen: true,
      Component: lazy(async () => {
        const module = await import("./page__collection/PageCapsuleTabsPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.PageCapsuleTabsPage),
            }),
        };
      }),
      source: files["./page__collection/PageCapsuleTabsPage.tsx"],
      sources: [
        {
          filename: "PageCapsuleTabsPage.tsx",
          markdownFilename: "PageCapsuleTabsPage.tsx",
          source: clean(files["./page__collection/PageCapsuleTabsPage.tsx"]),
        },
        {
          filename: "BulkActionsBar.tsx",
          markdownFilename: "BulkActionsBar.tsx",
          source: clean(files["./page__collection/BulkActionsBar.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.PageCapsuleTabsPage.tsx",
          source: clean(
            files["./page__collection/App.PageCapsuleTabsPage.tsx"],
          ),
        },
      ],
    },
    {
      name: "Inline edit (edit values directly in the list)",
      description:
        "For small per-cell edits you want to finish without leaving the list. Fix values without opening the detail screen.",
      heading: "Inline edit (edit values directly in the list)",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__collection/PageInlineEditTabsPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.PageInlineEditTabsPage),
            }),
        };
      }),
      source: files["./page__collection/PageInlineEditTabsPage.tsx"],
      sources: [
        {
          filename: "PageInlineEditTabsPage.tsx",
          markdownFilename: "PageInlineEditTabsPage.tsx",
          source: clean(files["./page__collection/PageInlineEditTabsPage.tsx"]),
        },
        {
          filename: "BulkActionsBar.tsx",
          markdownFilename: "BulkActionsBar.tsx",
          source: clean(files["./page__collection/BulkActionsBar.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.PageInlineEditTabsPage.tsx",
          source: clean(
            files["./page__collection/App.PageInlineEditTabsPage.tsx"],
          ),
        },
      ],
    },
    {
      name: "Grid / List toggle (for thumbnail-heavy catalogs)",
      description:
        "For merchandise identified by thumbnails or color. While the status tabs keep the stock-status filter applied, the icon-only Tabs.Tab on the right of the toolbar switches between a grid view and a dense list view. The list adds a 32\u00d732 thumbnail column right of the checkbox; the grid overlays the checkbox on the card's thumbnail.",
      heading: "Grid / List toggle (for thumbnail-heavy catalogs)",
      screen: true,
      Component: lazy(async () => {
        const module = await import("./page__collection/PageGridListTabsPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.PageGridListTabsPage),
            }),
        };
      }),
      source: files["./page__collection/PageGridListTabsPage.tsx"],
      sources: [
        {
          filename: "PageGridListTabsPage.tsx",
          markdownFilename: "PageGridListTabsPage.tsx",
          source: clean(files["./page__collection/PageGridListTabsPage.tsx"]),
        },
        {
          filename: "BulkActionsBar.tsx",
          markdownFilename: "BulkActionsBar.tsx",
          source: clean(files["./page__collection/BulkActionsBar.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.PageGridListTabsPage.tsx",
          source: clean(
            files["./page__collection/App.PageGridListTabsPage.tsx"],
          ),
        },
      ],
    },
  ],
  "page/dashboard-with-charts": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__dashboard-with-charts/SpendDashboardPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.SpendDashboardPage),
            }),
        };
      }),
      source: files["./page__dashboard-with-charts/SpendDashboardPage.tsx"],
      sources: [
        {
          filename: "SpendDashboardPage.tsx",
          markdownFilename: "SpendDashboardPage.tsx",
          source: clean(
            files["./page__dashboard-with-charts/SpendDashboardPage.tsx"],
          ),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.tsx",
          source: clean(files["./page__dashboard-with-charts/App.tsx"]),
        },
      ],
    },
  ],
  "page/detail-2col-action-panel": [
    {
      name: "2 columns \u00b7 ActionPanel",
      description:
        "For when you want review, approval, or task-creation actions always visible while reading the main content.",
      heading: "2 columns \u00b7 ActionPanel",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__detail-2col-action-panel/SupplierDetailPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.SupplierDetailPage),
            }),
        };
      }),
      source: files["./page__detail-2col-action-panel/SupplierDetailPage.tsx"],
      sources: [
        {
          filename: "SupplierDetailPage.tsx",
          markdownFilename: "SupplierDetailPage.tsx",
          source: clean(
            files["./page__detail-2col-action-panel/SupplierDetailPage.tsx"],
          ),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.SupplierDetailPage.tsx",
          source: clean(
            files[
              "./page__detail-2col-action-panel/App.SupplierDetailPage.tsx"
            ],
          ),
        },
      ],
    },
    {
      name: "Page tabs",
      description:
        "For switching between multiple sections \u2014 profile, related objects, conversations \u2014 without cutting separate URLs.",
      heading: "Page tabs",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__detail-2col-action-panel/DetailPageWithPageTabs");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.DetailPageWithPageTabs),
            }),
        };
      }),
      source:
        files["./page__detail-2col-action-panel/DetailPageWithPageTabs.tsx"],
      sources: [
        {
          filename: "DetailPageWithPageTabs.tsx",
          markdownFilename: "DetailPageWithPageTabs.tsx",
          source: clean(
            files[
              "./page__detail-2col-action-panel/DetailPageWithPageTabs.tsx"
            ],
          ),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.DetailPageWithPageTabs.tsx",
          source: clean(
            files[
              "./page__detail-2col-action-panel/App.DetailPageWithPageTabs.tsx"
            ],
          ),
        },
      ],
    },
  ],
  "page/document-page": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: true,
      Component: lazy(async () => {
        const module = await import("./page__document-page/DocumentEditorPage");
        return {
          default: () =>
            createElement(PageFrame, {
              fullBleed: true,
              children: (sidebarTrigger) =>
                createElement(module.DocumentEditorPage, {
                  sidebarLeftAccessory: sidebarTrigger,
                }),
            }),
        };
      }),
      source: files["./page__document-page/DocumentEditorPage.tsx"],
      sources: [
        {
          filename: "DocumentEditorPage.tsx",
          markdownFilename: "DocumentEditorPage.tsx",
          source: clean(files["./page__document-page/DocumentEditorPage.tsx"]),
        },
        {
          filename: "DocumentEditorSidebar.tsx",
          markdownFilename: "DocumentEditorSidebar.tsx",
          source: clean(
            files["./page__document-page/DocumentEditorSidebar.tsx"],
          ),
        },
        {
          filename: "DocumentEditorBubbleToolbar.tsx",
          markdownFilename: "DocumentEditorBubbleToolbar.tsx",
          source: clean(
            files["./page__document-page/DocumentEditorBubbleToolbar.tsx"],
          ),
        },
        {
          filename: "DocumentEditorInsertMenu.tsx",
          markdownFilename: "DocumentEditorInsertMenu.tsx",
          source: clean(
            files["./page__document-page/DocumentEditorInsertMenu.tsx"],
          ),
        },
        {
          filename: "DocumentEditorLinkPopover.tsx",
          markdownFilename: "DocumentEditorLinkPopover.tsx",
          source: clean(
            files["./page__document-page/DocumentEditorLinkPopover.tsx"],
          ),
        },
        {
          filename: "DocumentEditorPageEmbed.tsx",
          markdownFilename: "DocumentEditorPageEmbed.tsx",
          source: clean(
            files["./page__document-page/DocumentEditorPageEmbed.tsx"],
          ),
        },
        {
          filename: "DocumentEditorPageEmbedPicker.tsx",
          markdownFilename: "DocumentEditorPageEmbedPicker.tsx",
          source: clean(
            files["./page__document-page/DocumentEditorPageEmbedPicker.tsx"],
          ),
        },
        {
          filename: "DocumentPreviewHeadingAnchors.tsx",
          markdownFilename: "DocumentPreviewHeadingAnchors.tsx",
          source: clean(
            files["./page__document-page/DocumentPreviewHeadingAnchors.tsx"],
          ),
        },
        {
          filename: "DocumentPageRegistryContext.tsx",
          markdownFilename: "DocumentPageRegistryContext.tsx",
          source: clean(
            files["./page__document-page/DocumentPageRegistryContext.tsx"],
          ),
        },
        {
          filename: "documentPageRegistry.ts",
          markdownFilename: "documentPageRegistry.ts",
          source: clean(files["./page__document-page/documentPageRegistry.ts"]),
        },
        {
          filename: "documentEditorLink.ts",
          markdownFilename: "documentEditorLink.ts",
          source: clean(files["./page__document-page/documentEditorLink.ts"]),
        },
        {
          filename: "documentEditorHeading.ts",
          markdownFilename: "documentEditorHeading.ts",
          source: clean(
            files["./page__document-page/documentEditorHeading.ts"],
          ),
        },
        {
          filename: "documentEditorUrl.ts",
          markdownFilename: "documentEditorUrl.ts",
          source: clean(files["./page__document-page/documentEditorUrl.ts"]),
        },
        {
          filename: "documentEditorBlocks.ts",
          markdownFilename: "documentEditorBlocks.ts",
          source: clean(files["./page__document-page/documentEditorBlocks.ts"]),
        },
        {
          filename: "documentEditorSampleDocs.ts",
          markdownFilename: "documentEditorSampleDocs.ts",
          source: clean(
            files["./page__document-page/documentEditorSampleDocs.ts"],
          ),
        },
        {
          filename: "documentEditorStyles.ts",
          markdownFilename: "documentEditorStyles.ts",
          source: clean(files["./page__document-page/documentEditorStyles.ts"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.tsx",
          source: clean(files["./page__document-page/App.tsx"]),
        },
      ],
    },
  ],
  "page/email": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: true,
      Component: lazy(async () => {
        const module = await import("./page__email/EmailLayoutPage");
        return {
          default: () =>
            createElement(PageFrame, {
              fullBleed: true,
              children: createElement(module.EmailLayoutPage),
            }),
        };
      }),
      source: files["./page__email/EmailLayoutPage.tsx"],
      sources: [
        {
          filename: "EmailLayoutPage.tsx",
          markdownFilename: "EmailLayoutPage.tsx",
          source: clean(files["./page__email/EmailLayoutPage.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.tsx",
          source: clean(files["./page__email/App.tsx"]),
        },
      ],
    },
  ],
  "page/form-as-page": [
    {
      name: "Single column",
      description:
        "A straightforward layout where fields are filled in top to bottom. For standard create and edit forms.",
      heading: "Single column",
      screen: true,
      Component: lazy(async () => {
        const module = await import("./page__form-as-page/CreateTaskPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.CreateTaskPage),
            }),
        };
      }),
      source: files["./page__form-as-page/CreateTaskPage.tsx"],
      sources: [
        {
          filename: "CreateTaskPage.tsx",
          markdownFilename: "CreateTaskPage.tsx",
          source: clean(files["./page__form-as-page/CreateTaskPage.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.CreateTaskPage.tsx",
          source: clean(files["./page__form-as-page/App.CreateTaskPage.tsx"]),
        },
      ],
    },
    {
      name: "Section nav (anchors)",
      description:
        "For forms with many field groups you want to fill in any order. The left nav lets you jump between sections.",
      heading: "Section nav (anchors)",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__form-as-page/CreateTaskPageWithSectionNav");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.CreateTaskPageWithSectionNav),
            }),
        };
      }),
      source: files["./page__form-as-page/CreateTaskPageWithSectionNav.tsx"],
      sources: [
        {
          filename: "CreateTaskPageWithSectionNav.tsx",
          markdownFilename: "CreateTaskPageWithSectionNav.tsx",
          source: clean(
            files["./page__form-as-page/CreateTaskPageWithSectionNav.tsx"],
          ),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.CreateTaskPageWithSectionNav.tsx",
          source: clean(
            files["./page__form-as-page/App.CreateTaskPageWithSectionNav.tsx"],
          ),
        },
      ],
    },
    {
      name: "Wizard (multiple steps)",
      description:
        "For onboarding or request flows where you want users to focus on one step at a time.",
      heading: "Wizard (multiple steps)",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__form-as-page/CreateTaskPageWizard");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.CreateTaskPageWizard),
            }),
        };
      }),
      source: files["./page__form-as-page/CreateTaskPageWizard.tsx"],
      sources: [
        {
          filename: "CreateTaskPageWizard.tsx",
          markdownFilename: "CreateTaskPageWizard.tsx",
          source: clean(files["./page__form-as-page/CreateTaskPageWizard.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.CreateTaskPageWizard.tsx",
          source: clean(
            files["./page__form-as-page/App.CreateTaskPageWizard.tsx"],
          ),
        },
      ],
    },
  ],
  "page/pipeline-kanban": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__pipeline-kanban/PipelineKanbanPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.PipelineKanbanPage),
            }),
        };
      }),
      source: files["./page__pipeline-kanban/PipelineKanbanPage.tsx"],
      sources: [
        {
          filename: "PipelineKanbanPage.tsx",
          markdownFilename: "PipelineKanbanPage.tsx",
          source: clean(
            files["./page__pipeline-kanban/PipelineKanbanPage.tsx"],
          ),
        },
        {
          filename: "KanbanBoard.tsx",
          markdownFilename: "KanbanBoard.tsx",
          source: clean(files["./page__pipeline-kanban/KanbanBoard.tsx"]),
        },
        {
          filename: "RightSheet.tsx",
          markdownFilename: "RightSheet.tsx",
          source: clean(files["./page__pipeline-kanban/RightSheet.tsx"]),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.tsx",
          source: clean(files["./page__pipeline-kanban/App.tsx"]),
        },
      ],
    },
  ],
  "page/simple-master-crud": [
    {
      name: "Dialog (few fields)",
      description:
        "For creating and editing lightweight master records that fit in about four fields \u2014 code, name, and so on.",
      heading: "Dialog (few fields)",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__simple-master-crud/CategoriesMasterDialogPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.CategoriesMasterDialogPage),
            }),
        };
      }),
      source:
        files["./page__simple-master-crud/CategoriesMasterDialogPage.tsx"],
      sources: [
        {
          filename: "CategoriesMasterDialogPage.tsx",
          markdownFilename: "CategoriesMasterDialogPage.tsx",
          source: clean(
            files["./page__simple-master-crud/CategoriesMasterDialogPage.tsx"],
          ),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.CategoriesMasterDialogPage.tsx",
          source: clean(
            files[
              "./page__simple-master-crud/App.CategoriesMasterDialogPage.tsx"
            ],
          ),
        },
      ],
    },
    {
      name: "Sheet (many fields)",
      description:
        "For creating and editing master records with enough fields to need scrolling \u2014 parent category, tax profile, sort order, and more.",
      heading: "Sheet (many fields)",
      screen: true,
      Component: lazy(async () => {
        const module =
          await import("./page__simple-master-crud/CategoriesMasterSheetPage");
        return {
          default: () =>
            createElement(PageFrame, {
              children: createElement(module.CategoriesMasterSheetPage),
            }),
        };
      }),
      source: files["./page__simple-master-crud/CategoriesMasterSheetPage.tsx"],
      sources: [
        {
          filename: "CategoriesMasterSheetPage.tsx",
          markdownFilename: "CategoriesMasterSheetPage.tsx",
          source: clean(
            files["./page__simple-master-crud/CategoriesMasterSheetPage.tsx"],
          ),
        },
        {
          filename: "App.tsx",
          markdownFilename: "App.CategoriesMasterSheetPage.tsx",
          source: clean(
            files[
              "./page__simple-master-crud/App.CategoriesMasterSheetPage.tsx"
            ],
          ),
        },
      ],
    },
  ],
  "patterns/approval-flow": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__approval-flow/ApprovalFlow");
        return { default: () => createElement(module.ApprovalFlow) };
      }),
      source: files["./patterns__approval-flow/ApprovalFlow.tsx"],
      sources: [
        {
          filename: "ApprovalFlow.tsx",
          markdownFilename: "ApprovalFlow.tsx",
          source: clean(files["./patterns__approval-flow/ApprovalFlow.tsx"]),
        },
      ],
    },
  ],
  "patterns/approval-route-builder": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__approval-route-builder/ApprovalRouteBuilder");
        return { default: () => createElement(module.ApprovalRouteBuilder) };
      }),
      source:
        files["./patterns__approval-route-builder/ApprovalRouteBuilder.tsx"],
      sources: [
        {
          filename: "ApprovalRouteBuilder.tsx",
          markdownFilename: "ApprovalRouteBuilder.tsx",
          source: clean(
            files[
              "./patterns__approval-route-builder/ApprovalRouteBuilder.tsx"
            ],
          ),
        },
      ],
    },
  ],
  "patterns/conversation-thread": [
    {
      name: "Flat thread",
      description:
        "A flat, chronological list. For simple inquiry or report exchanges.",
      heading: "Flat thread",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__conversation-thread/InquiryThreadPage");
        return { default: () => createElement(module.FlatInquiryThread) };
      }),
      source:
        files["./patterns__conversation-thread/ConversationThreadPanel.tsx"],
      sources: [
        {
          filename: "ConversationThreadPanel.tsx",
          markdownFilename: "ConversationThreadPanel.tsx",
          source: clean(
            files[
              "./patterns__conversation-thread/ConversationThreadPanel.tsx"
            ],
          ),
        },
        {
          filename: "InquiryThreadPage.tsx",
          markdownFilename: "InquiryThreadPage.tsx",
          source: clean(
            files["./patterns__conversation-thread/InquiryThreadPage.tsx"],
          ),
        },
      ],
    },
    {
      name: "Threaded replies",
      description:
        "For collecting replies nested under a parent thread. Suited to conversation tabs on detail pages.",
      heading: "Threaded replies",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__conversation-thread/InquiryThreadPage");
        return { default: () => createElement(module.ThreadedInquiryThread) };
      }),
      source:
        files["./patterns__conversation-thread/ConversationThreadPanel.tsx"],
      sources: [
        {
          filename: "ConversationThreadPanel.tsx",
          markdownFilename: "ConversationThreadPanel.tsx",
          source: clean(
            files[
              "./patterns__conversation-thread/ConversationThreadPanel.tsx"
            ],
          ),
        },
        {
          filename: "InquiryThreadPage.tsx",
          markdownFilename: "InquiryThreadPage.tsx",
          source: clean(
            files["./patterns__conversation-thread/InquiryThreadPage.tsx"],
          ),
        },
      ],
    },
    {
      name: "Markdown",
      description:
        "When message bodies are written in Markdown and need formatting.",
      heading: "Markdown",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__conversation-thread/MarkdownThread");
        return { default: () => createElement(module.MarkdownThread) };
      }),
      source:
        files["./patterns__conversation-thread/ConversationThreadPanel.tsx"],
      sources: [
        {
          filename: "ConversationThreadPanel.tsx",
          markdownFilename: "ConversationThreadPanel.tsx",
          source: clean(
            files[
              "./patterns__conversation-thread/ConversationThreadPanel.tsx"
            ],
          ),
        },
        {
          filename: "MarkdownThread.tsx",
          markdownFilename: "MarkdownThread.tsx",
          source: clean(
            files["./patterns__conversation-thread/MarkdownThread.tsx"],
          ),
        },
      ],
    },
    {
      name: "With file attachments",
      description: "When messages carry file attachments and previews.",
      heading: "With file attachments",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__conversation-thread/AttachmentsThread");
        return { default: () => createElement(module.AttachmentsThread) };
      }),
      source:
        files["./patterns__conversation-thread/ConversationThreadPanel.tsx"],
      sources: [
        {
          filename: "ConversationThreadPanel.tsx",
          markdownFilename: "ConversationThreadPanel.tsx",
          source: clean(
            files[
              "./patterns__conversation-thread/ConversationThreadPanel.tsx"
            ],
          ),
        },
        {
          filename: "AttachmentsThread.tsx",
          markdownFilename: "AttachmentsThread.tsx",
          source: clean(
            files["./patterns__conversation-thread/AttachmentsThread.tsx"],
          ),
        },
        {
          filename: "FilePreview.tsx",
          markdownFilename: "FilePreview.tsx",
          source: clean(
            files["./patterns__conversation-thread/FilePreview.tsx"],
          ),
        },
      ],
    },
    {
      name: "Actions on each comment",
      description:
        "When each comment needs actions such as Reply / Like / Edit.",
      heading: "Actions on each comment",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__conversation-thread/ActionsThread");
        return { default: () => createElement(module.ActionsThread) };
      }),
      source:
        files["./patterns__conversation-thread/ConversationThreadPanel.tsx"],
      sources: [
        {
          filename: "ConversationThreadPanel.tsx",
          markdownFilename: "ConversationThreadPanel.tsx",
          source: clean(
            files[
              "./patterns__conversation-thread/ConversationThreadPanel.tsx"
            ],
          ),
        },
        {
          filename: "ActionsThread.tsx",
          markdownFilename: "ActionsThread.tsx",
          source: clean(
            files["./patterns__conversation-thread/ActionsThread.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/data-charts": [
    {
      name: "Line chart",
      description: "For showing a continuous trend in a numeric value.",
      heading: "Line chart",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__data-charts/LineChartCard");
        return { default: () => createElement(module.LineChartCard) };
      }),
      source: files["./patterns__data-charts/LineChartCard.tsx"],
      sources: [
        {
          filename: "LineChartCard.tsx",
          markdownFilename: "LineChartCard.tsx",
          source: clean(files["./patterns__data-charts/LineChartCard.tsx"]),
        },
        {
          filename: "chartTokens.ts",
          markdownFilename: "chartTokens.ts",
          source: clean(files["./patterns__data-charts/chartTokens.ts"]),
        },
      ],
    },
    {
      name: "Vertical bar",
      description: "For comparing quantities across discrete categories.",
      heading: "Vertical bar",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__data-charts/VerticalBarChartCard");
        return { default: () => createElement(module.VerticalBarChartCard) };
      }),
      source: files["./patterns__data-charts/VerticalBarChartCard.tsx"],
      sources: [
        {
          filename: "VerticalBarChartCard.tsx",
          markdownFilename: "VerticalBarChartCard.tsx",
          source: clean(
            files["./patterns__data-charts/VerticalBarChartCard.tsx"],
          ),
        },
        {
          filename: "chartTokens.ts",
          markdownFilename: "chartTokens.ts",
          source: clean(files["./patterns__data-charts/chartTokens.ts"]),
        },
      ],
    },
    {
      name: "Horizontal bar",
      description: "For comparisons with long labels and many items.",
      heading: "Horizontal bar",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__data-charts/HorizontalBarChartCard");
        return { default: () => createElement(module.HorizontalBarChartCard) };
      }),
      source: files["./patterns__data-charts/HorizontalBarChartCard.tsx"],
      sources: [
        {
          filename: "HorizontalBarChartCard.tsx",
          markdownFilename: "HorizontalBarChartCard.tsx",
          source: clean(
            files["./patterns__data-charts/HorizontalBarChartCard.tsx"],
          ),
        },
        {
          filename: "chartTokens.ts",
          markdownFilename: "chartTokens.ts",
          source: clean(files["./patterns__data-charts/chartTokens.ts"]),
        },
      ],
    },
    {
      name: "Pie chart",
      description:
        "For showing each part's share of the whole (few categories).",
      heading: "Pie chart",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__data-charts/PieChartCard");
        return { default: () => createElement(module.PieChartCard) };
      }),
      source: files["./patterns__data-charts/PieChartCard.tsx"],
      sources: [
        {
          filename: "PieChartCard.tsx",
          markdownFilename: "PieChartCard.tsx",
          source: clean(files["./patterns__data-charts/PieChartCard.tsx"]),
        },
        {
          filename: "chartTokens.ts",
          markdownFilename: "chartTokens.ts",
          source: clean(files["./patterns__data-charts/chartTokens.ts"]),
        },
      ],
    },
    {
      name: "Donut chart",
      description: "For composition plus a center label such as a total.",
      heading: "Donut chart",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__data-charts/DonutChartCard");
        return { default: () => createElement(module.DonutChartCard) };
      }),
      source: files["./patterns__data-charts/DonutChartCard.tsx"],
      sources: [
        {
          filename: "DonutChartCard.tsx",
          markdownFilename: "DonutChartCard.tsx",
          source: clean(files["./patterns__data-charts/DonutChartCard.tsx"]),
        },
        {
          filename: "chartTokens.ts",
          markdownFilename: "chartTokens.ts",
          source: clean(files["./patterns__data-charts/chartTokens.ts"]),
        },
      ],
    },
    {
      name: "Stacked vertical bar",
      description: "For tracking a per-period breakdown stacked over time.",
      heading: "Stacked vertical bar",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__data-charts/StackedBarChartCard");
        return { default: () => createElement(module.StackedBarChartCard) };
      }),
      source: files["./patterns__data-charts/StackedBarChartCard.tsx"],
      sources: [
        {
          filename: "StackedBarChartCard.tsx",
          markdownFilename: "StackedBarChartCard.tsx",
          source: clean(
            files["./patterns__data-charts/StackedBarChartCard.tsx"],
          ),
        },
        {
          filename: "chartTokens.ts",
          markdownFilename: "chartTokens.ts",
          source: clean(files["./patterns__data-charts/chartTokens.ts"]),
        },
      ],
    },
    {
      name: "Gantt chart",
      description: "For laying out ordered milestones along a timeline.",
      heading: "Gantt chart",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__data-charts/GanttChart");
        return { default: () => createElement(module.GanttChart) };
      }),
      source: files["./patterns__data-charts/GanttChart.tsx"],
      sources: [
        {
          filename: "GanttChart.tsx",
          markdownFilename: "GanttChart.tsx",
          source: clean(files["./patterns__data-charts/GanttChart.tsx"]),
        },
        {
          filename: "GanttChart.css",
          markdownFilename: "GanttChart.css",
          source: clean(files["./patterns__data-charts/GanttChart.css"]),
        },
      ],
    },
  ],
  "patterns/form-builder": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__form-builder/FormBuilder");
        return { default: () => createElement(module.FormBuilder) };
      }),
      source: files["./patterns__form-builder/FormBuilder.tsx"],
      sources: [
        {
          filename: "FormBuilder.tsx",
          markdownFilename: "FormBuilder.tsx",
          source: clean(files["./patterns__form-builder/FormBuilder.tsx"]),
        },
      ],
    },
  ],
  "patterns/multi-step-form": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__multi-step-form/MultiStepForm");
        return { default: () => createElement(module.MultiStepForm) };
      }),
      source: files["./patterns__multi-step-form/MultiStepForm.tsx"],
      sources: [
        {
          filename: "MultiStepForm.tsx",
          markdownFilename: "MultiStepForm.tsx",
          source: clean(files["./patterns__multi-step-form/MultiStepForm.tsx"]),
        },
      ],
    },
  ],
  "patterns/notification-panel": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__notification-panel/NotificationPanelWithSidebar");
        return {
          default: () => createElement(module.NotificationPanelWithSidebar),
        };
      }),
      source:
        files[
          "./patterns__notification-panel/NotificationPanelWithSidebar.tsx"
        ],
      sources: [
        {
          filename: "NotificationPanelWithSidebar.tsx",
          markdownFilename: "NotificationPanelWithSidebar.tsx",
          source: clean(
            files[
              "./patterns__notification-panel/NotificationPanelWithSidebar.tsx"
            ],
          ),
        },
        {
          filename: "NotificationPanel.tsx",
          markdownFilename: "NotificationPanel.tsx",
          source: clean(
            files["./patterns__notification-panel/NotificationPanel.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/pipeline-stage-manager": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__pipeline-stage-manager/PipelineStageManager");
        return { default: () => createElement(module.PipelineStageManager) };
      }),
      source:
        files["./patterns__pipeline-stage-manager/PipelineStageManager.tsx"],
      sources: [
        {
          filename: "PipelineStageManager.tsx",
          markdownFilename: "PipelineStageManager.tsx",
          source: clean(
            files[
              "./patterns__pipeline-stage-manager/PipelineStageManager.tsx"
            ],
          ),
        },
      ],
    },
  ],
  "patterns/rich-text-editor": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__rich-text-editor/RichTextEditor");
        return { default: () => createElement(module.RichTextEditor) };
      }),
      source: files["./patterns__rich-text-editor/RichTextEditor.tsx"],
      sources: [
        {
          filename: "RichTextEditor.tsx",
          markdownFilename: "RichTextEditor.tsx",
          source: clean(
            files["./patterns__rich-text-editor/RichTextEditor.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/timeline": [
    {
      name: "Editable staircase",
      description:
        "Starts as one full-width bar. Click a bar to recolor or split it (a split steps the track down onto a new lane). Drag a bar's right edge to grow it \u2014 the next bar keeps its right edge pinned and narrows from the left.",
      heading: "Editable staircase",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__timeline/GanttEditor");
        return { default: () => createElement(module.GanttEditor) };
      }),
      source: files["./patterns__timeline/GanttEditor.tsx"],
      sources: [
        {
          filename: "GanttEditor.tsx",
          markdownFilename: "GanttEditor.tsx",
          source: clean(files["./patterns__timeline/GanttEditor.tsx"]),
        },
        {
          filename: "Timeline.tsx",
          markdownFilename: "Timeline.tsx",
          source: clean(files["./patterns__timeline/Timeline.tsx"]),
        },
      ],
    },
    {
      name: "Dependencies & lanes",
      description:
        "Read-only view: orthogonal dependency links between bars, plus multiple bars sharing one lane.",
      heading: "Dependencies & lanes",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__timeline/DependencyTimeline");
        return { default: () => createElement(module.DependencyTimeline) };
      }),
      source: files["./patterns__timeline/DependencyTimeline.tsx"],
      sources: [
        {
          filename: "DependencyTimeline.tsx",
          markdownFilename: "DependencyTimeline.tsx",
          source: clean(files["./patterns__timeline/DependencyTimeline.tsx"]),
        },
        {
          filename: "Timeline.tsx",
          markdownFilename: "Timeline.tsx",
          source: clean(files["./patterns__timeline/Timeline.tsx"]),
        },
      ],
    },
  ],
  "patterns/user-profile-dialog": [
    {
      name: "Small dialog",
      description:
        "A compact single-pane dialog for quick profile edits. Shows name, email, language preference, and read-only status \u2014 no tabs needed.",
      heading: "Small dialog",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return {
          default: () => createElement(module.ProfileExample, { small: true }),
        };
      }),
      source:
        files["./patterns__user-profile-dialog/UserProfileDialogSmall.tsx"],
      sources: [
        {
          filename: "UserProfileDialogSmall.tsx",
          markdownFilename: "UserProfileDialogSmall.tsx",
          source: clean(
            files["./patterns__user-profile-dialog/UserProfileDialogSmall.tsx"],
          ),
        },
      ],
    },
    {
      name: "Two-column dialog",
      description:
        "The full two-pane profile dialog. The left rail shows tab navigation; the right pane mixes editable inputs with read-only organization fields.",
      heading: "Two-column dialog",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.ProfileExample) };
      }),
      source: files["./patterns__user-profile-dialog/UserProfileDialog.tsx"],
      sources: [
        {
          filename: "UserProfileDialog.tsx",
          markdownFilename: "UserProfileDialog.tsx",
          source: clean(
            files["./patterns__user-profile-dialog/UserProfileDialog.tsx"],
          ),
        },
      ],
    },
    {
      name: "Sidebar user menu \u2192 dialog",
      description:
        "Clicking the user menu at the bottom of the sidebar opens the profile dialog.",
      heading: "Sidebar user menu \u2192 dialog",
      screen: false,
      Component: lazy(async () => {
        const module =
          await import("./patterns__user-profile-dialog/UserMenuSidebarShowcase");
        return { default: () => createElement(module.UserMenuSidebarShowcase) };
      }),
      source:
        files["./patterns__user-profile-dialog/UserMenuSidebarShowcase.tsx"],
      sources: [
        {
          filename: "UserMenuSidebarShowcase.tsx",
          markdownFilename: "UserMenuSidebarShowcase.tsx",
          source: clean(
            files[
              "./patterns__user-profile-dialog/UserMenuSidebarShowcase.tsx"
            ],
          ),
        },
        {
          filename: "UserProfileDialog.tsx",
          markdownFilename: "UserProfileDialog.tsx",
          source: clean(
            files["./patterns__user-profile-dialog/UserProfileDialog.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/grid-view": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.GridExample) };
      }),
      source: files["./patterns__grid-view/GridView.tsx"],
      sources: [
        {
          filename: "GridView.tsx",
          markdownFilename: "GridView.tsx",
          source: clean(files["./patterns__grid-view/GridView.tsx"]),
        },
      ],
    },
  ],
  "patterns/field-diff-table": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.FieldDiffExample) };
      }),
      source: files["./patterns__field-diff-table/FieldDiffTable.tsx"],
      sources: [
        {
          filename: "FieldDiffTable.tsx",
          markdownFilename: "FieldDiffTable.tsx",
          source: clean(
            files["./patterns__field-diff-table/FieldDiffTable.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/bulk-actions-bar": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.BulkExample) };
      }),
      source: files["./patterns__bulk-actions-bar/BulkActionsBar.tsx"],
      sources: [
        {
          filename: "BulkActionsBar.tsx",
          markdownFilename: "BulkActionsBar.tsx",
          source: clean(
            files["./patterns__bulk-actions-bar/BulkActionsBar.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/datatable-inline-edit": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.InlineExample) };
      }),
      source:
        files["./patterns__datatable-inline-edit/DatatableInlineEdit.tsx"],
      sources: [
        {
          filename: "DatatableInlineEdit.tsx",
          markdownFilename: "DatatableInlineEdit.tsx",
          source: clean(
            files["./patterns__datatable-inline-edit/DatatableInlineEdit.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/supplier-cascader": [
    {
      name: "Block preview",
      StateProvider: SupplierPreviewStateProvider,
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.SupplierExample) };
      }),
      source: files["./patterns__supplier-cascader/SupplierCascader.tsx"],
      sources: [
        {
          filename: "SupplierCascader.tsx",
          markdownFilename: "SupplierCascader.tsx",
          source: clean(
            files["./patterns__supplier-cascader/SupplierCascader.tsx"],
          ),
        },
        {
          filename: "useSupplierCascader.ts",
          markdownFilename: "useSupplierCascader.ts",
          source: clean(
            files["./patterns__supplier-cascader/useSupplierCascader.ts"],
          ),
        },
        {
          filename: "CompanyNameSearch.tsx",
          markdownFilename: "CompanyNameSearch.tsx",
          source: clean(
            files["./patterns__supplier-cascader/CompanyNameSearch.tsx"],
          ),
        },
        {
          filename: "mockData.ts",
          markdownFilename: "mockData.ts",
          source: clean(files["./patterns__supplier-cascader/mockData.ts"]),
        },
      ],
    },
  ],
  "patterns/right-sheet-custom": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.RightSheetExample) };
      }),
      source: files["./patterns__right-sheet-custom/RightSheet.tsx"],
      sources: [
        {
          filename: "RightSheet.tsx",
          markdownFilename: "RightSheet.tsx",
          source: clean(files["./patterns__right-sheet-custom/RightSheet.tsx"]),
        },
      ],
    },
  ],
  "patterns/thread-composer": [
    {
      name: "Block preview",
      description: "",
      heading: "",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./showcases");
        return { default: () => createElement(module.ComposerExample) };
      }),
      source: files["./patterns__thread-composer/ThreadComposer.tsx"],
      sources: [
        {
          filename: "ThreadComposer.tsx",
          markdownFilename: "ThreadComposer.tsx",
          source: clean(
            files["./patterns__thread-composer/ThreadComposer.tsx"],
          ),
        },
      ],
    },
  ],
  "patterns/ai-chat": [
    {
      name: "Assistant panel (assembled)",
      description:
        "All blocks wired to a scripted mock. Each starter suggestion demos one behavior \u2014 tool calls with citations, streamed reasoning, a data answer, and an error \u2014 and the history button switches to past conversations. Swap mockAssistant.ts for a real streaming backend to go live.",
      heading: "Assistant panel (assembled)",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/AssistantPanelDemo");
        return { default: () => createElement(module.AssistantPanelDemo) };
      }),
      source: files["./patterns__ai-chat/AssistantPanel.tsx"],
      sources: [
        {
          filename: "AssistantPanel.tsx",
          markdownFilename: "AssistantPanel.tsx",
          source: clean(files["./patterns__ai-chat/AssistantPanel.tsx"]),
        },
        {
          filename: "mockAssistant.ts",
          markdownFilename: "mockAssistant.ts",
          source: clean(files["./patterns__ai-chat/mockAssistant.ts"]),
        },
        {
          filename: "AssistantPanelDemo.tsx",
          markdownFilename: "AssistantPanelDemo.tsx",
          source: clean(files["./patterns__ai-chat/AssistantPanelDemo.tsx"]),
        },
      ],
    },
    {
      name: "Message & response",
      description:
        "User turns are right-aligned primary bubbles; assistant turns render full width so reasoning, tool calls, and citations stack inside the same content column. Response renders the markdown subset assistants actually emit (bold, code, links, lists) without a markdown dependency.",
      heading: "Message & response",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/MessageDemo");
        return { default: () => createElement(module.MessageDemo) };
      }),
      source: files["./patterns__ai-chat/MessageDemo.tsx"],
      sources: [
        {
          filename: "MessageDemo.tsx",
          markdownFilename: "MessageDemo.tsx",
          source: clean(files["./patterns__ai-chat/MessageDemo.tsx"]),
        },
        {
          filename: "Message.tsx",
          markdownFilename: "Message.tsx",
          source: clean(files["./patterns__ai-chat/Message.tsx"]),
        },
        {
          filename: "Response.tsx",
          markdownFilename: "Response.tsx",
          source: clean(files["./patterns__ai-chat/Response.tsx"]),
        },
      ],
    },
    {
      name: "Reasoning (thinking)",
      description:
        'Collapsible thinking block for reasoning models. It auto-opens while tokens stream and auto-closes when done, showing "Thought for Ns" \u2014 unless the reader toggles it manually. Press Replay to watch the full cycle.',
      heading: "Reasoning (thinking)",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/ReasoningDemo");
        return { default: () => createElement(module.ReasoningDemo) };
      }),
      source: files["./patterns__ai-chat/ReasoningDemo.tsx"],
      sources: [
        {
          filename: "ReasoningDemo.tsx",
          markdownFilename: "ReasoningDemo.tsx",
          source: clean(files["./patterns__ai-chat/ReasoningDemo.tsx"]),
        },
        {
          filename: "Reasoning.tsx",
          markdownFilename: "Reasoning.tsx",
          source: clean(files["./patterns__ai-chat/Reasoning.tsx"]),
        },
      ],
    },
    {
      name: "Chain of thought",
      description:
        "Structured step timeline for agentic turns \u2014 the discrete plan being executed, each step with a complete / active / pending status and optional result chips. Use Reasoning for free-form thinking text and this for multi-step tool plans.",
      heading: "Chain of thought",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/ChainOfThoughtDemo");
        return { default: () => createElement(module.ChainOfThoughtDemo) };
      }),
      source: files["./patterns__ai-chat/ChainOfThoughtDemo.tsx"],
      sources: [
        {
          filename: "ChainOfThoughtDemo.tsx",
          markdownFilename: "ChainOfThoughtDemo.tsx",
          source: clean(files["./patterns__ai-chat/ChainOfThoughtDemo.tsx"]),
        },
        {
          filename: "ChainOfThought.tsx",
          markdownFilename: "ChainOfThought.tsx",
          source: clean(files["./patterns__ai-chat/ChainOfThought.tsx"]),
        },
      ],
    },
    {
      name: "Tool calls",
      description:
        "Collapsible card per tool invocation with the four lifecycle states (preparing \u2192 running \u2192 done / error). Expand a card to inspect the input parameters and the JSON result. In a live loop you update one card in place as stream parts arrive.",
      heading: "Tool calls",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/ToolDemo");
        return { default: () => createElement(module.ToolDemo) };
      }),
      source: files["./patterns__ai-chat/ToolDemo.tsx"],
      sources: [
        {
          filename: "ToolDemo.tsx",
          markdownFilename: "ToolDemo.tsx",
          source: clean(files["./patterns__ai-chat/ToolDemo.tsx"]),
        },
        {
          filename: "Tool.tsx",
          markdownFilename: "Tool.tsx",
          source: clean(files["./patterns__ai-chat/Tool.tsx"]),
        },
      ],
    },
    {
      name: "Sources (citations)",
      description:
        'Compact "Used N sources" trigger under a grounded answer; expanding lists what the model actually consulted. Wire each Source\'s onClick to open the cited document next to the chat.',
      heading: "Sources (citations)",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/SourcesDemo");
        return { default: () => createElement(module.SourcesDemo) };
      }),
      source: files["./patterns__ai-chat/SourcesDemo.tsx"],
      sources: [
        {
          filename: "SourcesDemo.tsx",
          markdownFilename: "SourcesDemo.tsx",
          source: clean(files["./patterns__ai-chat/SourcesDemo.tsx"]),
        },
        {
          filename: "Sources.tsx",
          markdownFilename: "Sources.tsx",
          source: clean(files["./patterns__ai-chat/Sources.tsx"]),
        },
      ],
    },
    {
      name: "Suggestions",
      description:
        "Starter-prompt chips for the empty state. Each chip submits its text as if typed \u2014 the fastest way to teach users what the assistant can do, and (as in the assembled panel) a handy way to expose demo scenarios.",
      heading: "Suggestions",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/SuggestionDemo");
        return { default: () => createElement(module.SuggestionDemo) };
      }),
      source: files["./patterns__ai-chat/SuggestionDemo.tsx"],
      sources: [
        {
          filename: "SuggestionDemo.tsx",
          markdownFilename: "SuggestionDemo.tsx",
          source: clean(files["./patterns__ai-chat/SuggestionDemo.tsx"]),
        },
        {
          filename: "Suggestion.tsx",
          markdownFilename: "Suggestion.tsx",
          source: clean(files["./patterns__ai-chat/Suggestion.tsx"]),
        },
      ],
    },
    {
      name: "Message actions",
      description:
        "Icon-button row under a finished assistant turn \u2014 copy, retry, feedback. Keep it outside the streaming path and only show it once the turn completes.",
      heading: "Message actions",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/ActionsDemo");
        return { default: () => createElement(module.ActionsDemo) };
      }),
      source: files["./patterns__ai-chat/ActionsDemo.tsx"],
      sources: [
        {
          filename: "ActionsDemo.tsx",
          markdownFilename: "ActionsDemo.tsx",
          source: clean(files["./patterns__ai-chat/ActionsDemo.tsx"]),
        },
        {
          filename: "Actions.tsx",
          markdownFilename: "Actions.tsx",
          source: clean(files["./patterns__ai-chat/Actions.tsx"]),
        },
      ],
    },
    {
      name: "Prompt input",
      description:
        "Composer with an auto-growing textarea, attachment flow, and a status-aware submit button that becomes a stop button while streaming. Enter submits and is IME-safe \u2014 Enter during kana\u2192kanji conversion confirms the candidate instead of sending.",
      heading: "Prompt input",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/PromptInputDemo");
        return { default: () => createElement(module.PromptInputDemo) };
      }),
      source: files["./patterns__ai-chat/PromptInputDemo.tsx"],
      sources: [
        {
          filename: "PromptInputDemo.tsx",
          markdownFilename: "PromptInputDemo.tsx",
          source: clean(files["./patterns__ai-chat/PromptInputDemo.tsx"]),
        },
        {
          filename: "PromptInput.tsx",
          markdownFilename: "PromptInput.tsx",
          source: clean(files["./patterns__ai-chat/PromptInput.tsx"]),
        },
        {
          filename: "Loader.tsx",
          markdownFilename: "Loader.tsx",
          source: clean(files["./patterns__ai-chat/Loader.tsx"]),
        },
      ],
    },
    {
      name: "Conversation history",
      description:
        "Grouped list of past conversations for reopening an earlier chat. Layout-agnostic \u2014 render it inside the panel (as the assembled demo does), in a popover, or as a sidebar section of a full chat page.",
      heading: "Conversation history",
      screen: false,
      Component: lazy(async () => {
        const module = await import("./patterns__ai-chat/ChatHistoryDemo");
        return { default: () => createElement(module.ChatHistoryDemo) };
      }),
      source: files["./patterns__ai-chat/ChatHistoryDemo.tsx"],
      sources: [
        {
          filename: "ChatHistoryDemo.tsx",
          markdownFilename: "ChatHistoryDemo.tsx",
          source: clean(files["./patterns__ai-chat/ChatHistoryDemo.tsx"]),
        },
        {
          filename: "ChatHistory.tsx",
          markdownFilename: "ChatHistory.tsx",
          source: clean(files["./patterns__ai-chat/ChatHistory.tsx"]),
        },
      ],
    },
  ],
};
const component = lazy(() =>
  import("./components").then((m) => ({ default: m.ReferenceComponent })),
);
export function getReferenceDemos(entry: Entry): Demo[] {
  if (entry.category === "components")
    return [
      {
        name: entry.title,
        Component: () => createElement(component, { slug: entry.slug }),
        source: "",
      },
    ];
  return resources[`${entry.category}/${entry.slug}`] ?? [];
}

export function getReferenceMarkdownSources(entry: Entry) {
  const demos = getReferenceDemos(entry);
  const available = new Map(
    demos
      .flatMap(
        (d) => d.sources ?? [{ filename: `${d.name}.tsx`, source: d.source }],
      )
      .filter((f) => !f.filename.endsWith("Demo.tsx"))
      .map((f) => [
        f.markdownFilename ?? f.filename,
        { filename: f.markdownFilename ?? f.filename, source: f.source },
      ]),
  );
  return (entry.markdownFiles ?? [...available.keys()]).flatMap((filename) => {
    const source = available.get(filename);
    if (source) return [source];
    const raw = files[`./${entry.category}__${entry.slug}/${filename}`];
    return raw ? [{ filename, source: clean(raw) }] : [];
  });
}
