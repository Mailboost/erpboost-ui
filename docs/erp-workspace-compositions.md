# Workspace and developer presentation components

These four additions compose existing primitives without editing their source or styles. Routing, authentication, Python execution, resource validation and data conversion stay in the consuming application.

| Subpath | UI responsibility | Consumer responsibility |
| --- | --- | --- |
| workspace-frame | Header/sidebar grid, compact sidebar width, independently scrolling content, page/fill/flush modes | Header/navigation JSX, routes, selected organization/connection, login and overlay hosts |
| resize-control | Existing ResizeHandle with pointer capture/release, axis-specific keyboard increments, Home/End bounds | Controlled size, minimum/maximum, panel side and placement |
| inline-create | Existing Input/Button/FileList/Alert with composition-safe Enter, nested Escape cancellation, errors associated with the input | Name value, trimming/validation, resource creation, availability and error message |
| data-preview | Read-only Table composition, row numbering, horizontal scroll, empty/notice slots | Column order, rendered values and exact serialization, row identity, query/execution and preview limits |

WorkspaceFrame does not load AppShell, auth or router services. Consumers import the four subpaths and `@mailboost/erpboost-ui/styles`. WorkspaceFrame.Sidebar wraps an unchanged SidebarPanel. Its desktop/compact widths default to 176/72 pixels and can be supplied explicitly. Content uses page padding by default, fill for height-constrained collections, and flush for editors/databases.

ResizeControl uses absolute pointer coordinates relative to the drag start rather than browser movement deltas. A panel after the separator grows toward the start by default; use panelSide="start" for the inverse. Only the primary pointer can start a drag. Pointer up/cancel/lost capture stop it. Home and End set minimum and maximum. Disabled controls do not accept keyboard or pointer resizing. For an edge handle inside a relatively positioned panel, use placement="overlay" so it spans the full edge rather than occupying a zero-height flex row.

InlineCreate does not normalize input. The consumer can preserve spaces/case and implement validation. IME Enter and legacy keyCode 229 do not create resources. Escape prevents the parent editor/dialog from closing. DataPreview never parses numbers, serializes objects, infers columns or assumes that previewed data has been saved.

The catalogue includes four separate examples. Regression checks cover exact values, both resize axes and boundaries, pointer release, IME composition, consumer validation, nested Escape, narrow-view table scrolling and independently scrolling workspace content. The packed-package consumer checks standalone imports without auth, AI or router dependencies. ERPBoost browser fixtures intercept external calls and reject all persistent writes.
