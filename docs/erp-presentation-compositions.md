# ERP presentation compositions

These are additive compositions of the existing components. Existing Button, Table, Dialog, Sheet, Skeleton, WorkflowNode, providers and their appearance are unchanged. Import `@mailboost/erpboost-ui/styles` once as usual. The additions work without AppShell authentication or routing.

- `EditableGrid` (`/editable-grid`): typed column metadata, compound row identity, selection, filtering, sorting, resizing, frozen columns, pagination and keyboard navigation. The consumer supplies `renderEditor`, `onSaveCell`, `onDelete`, and row/open/schema callbacks. Exact numeric strings remain strings. The component has no HTTP, GraphQL, database schema or authorization dependency. `rowKey` and `rowLimit` are explicit consumer inputs; reserved application columns are filtered in the adapter.
- `RecordPanel`, `RecordPanelBody`, `RecordPanelFooter`, `RecordEditor` (`/record-panel`): existing Dialog/Sheet compositions with scroll regions, initial focus, busy-close guards and optional dirty-record confirmation. Width and portal container are explicit props. The consumer provides fields, validation, persistence and title. Closing a dirty editor never saves it automatically.
- `LoadingPlaceholder`, the loading layouts and `ContextLoading` (`/loading-layouts`): decorative Skeleton wrappers, labelled loading regions and page/workspace arrangements. The contrast adjustment belongs to the new wrapper; the existing Skeleton is unchanged. Existing pulse and reduced-motion behavior are retained.
- `WorkflowGraph` (`/workflow-graph`): display-only steps, dependency links, orientation, fit/zoom and keyboard node selection. Supply already-resolved titles, states, metrics and an `onSelect(id)` callback. Python parsing, dataset execution states and navigation to code remain outside this component.

The four catalogue patterns show the published API. New regression tests cover compound identity and numeric strings, read-only schema controls, resizing, decorative loading state, busy panel closing and dirty-record discard. Browser validation covers actual popup/portal behavior separately.

## Boundary

The library owns reusable presentation and interaction. ERPBoost owns API clients, access checks, persistence, column type conversion, optimistic revisions, Python parsing and ERP status/result mapping. Application-specific form content and labels are composed from existing components; they are not configuration-generated HTML or hidden business rules.
