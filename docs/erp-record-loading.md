# Record loading compositions

`@mailboost/erpboost-ui/record-loading` adds decorative loading shapes. Existing Skeleton, LoadingPlaceholder, Table, FormGrid, DetailTable and Card implementations remain unchanged.

- `TableLoadingRows`: render directly in `Table.Body`. Supply keyed columns, optional shape/width/cellClassName and `rows` (default 8). `shape="empty"` keeps action columns empty. It emits semantic `tr`/`td` elements hidden from assistive technology.
- `FormLoadingFields`: supply keyed string labels with `input`, `lookup` or `textarea` shapes and optional `fullWidth`. Uses FormGrid's container-based responsive layout and creates no inputs or linked form labels.
- `RecordPlaceholder`: title, action, badge, text and field shapes, with optional className/style. Shapes use the existing placeholder tone and reduced-motion support.

The application owns field names, headers, real column widths, loading lifecycle, status announcements and requests. Label the surrounding region, set `aria-busy` there, and provide one loading status message. Keep table headers outside `TableLoadingRows`. Replace shapes with actual records/controls when ready; do not put business data into these placeholders. DetailTable continues to own horizontal scrolling and sticky actions.

ERPBoost uses these parts for order collection rows, detail form fields, detail rows and decorative title/action slots. Required fields, permissions, draft state, status meaning, save and ERP submission stay in OrdersPanel. Obsolete app-only skeleton selectors and duplicate numeric alignment are removed.

The catalogue example demonstrates loading/loaded transitions and a scrollable detail table. Checks cover valid table structure, decorative accessibility, inert labels, loading lifecycle, desktop/390px layout, contained horizontal scrolling and reduced motion. No real API writes are used.
