# Additional ERPBoost presentation components

These additions compose the existing library. No existing component source, CSS, or API is edited. The eight subpath entries are also exported from the package root and demonstrated in the catalogue.

| Entry | Shared presentation | Consumer responsibility |
| --- | --- | --- |
| resource-picker | ResourcePicker: normalized search, trigger, list, optional rename/action. LookupInput: input/popups, selected label retention, nested Escape | Fetch/debounce, available options, selected ID, business conversion and navigation |
| action-menu | ActionMenu and AccountMenu: trigger, identity/avatar fallback, available action items | Authorization, user retrieval, action implementations and logout |
| sensitive-input | SensitiveInput: conceal/reveal button with accessible labels, input slot | Input component, value, validation and erasing values on close |
| action-confirmation | ActionConfirmation: existing RecordPanel and Button composition with busy-close guards | Dirty state, message, asynchronous operation and navigation decision |
| collection-layout | CollectionLayout: heading, filters, scrollable results/table area and footer | Queries, table cells, status filters, pagination and business content |
| record-layouts | FormGrid, DetailTable, RecordActions: responsive form placement, wide line table with fixed action cells, footer | Field definitions, exact values, validation, line changes and save/submit actions |
| record-history | HistoryList and HistoryEntry: status/time cards with content slots | Status meaning, timestamp formatting, queries and results |
| value-editor | ValueEditor: existing CellEditor with text/boolean input, busy/error state, keyboard save and NULL action | Initial formatting, parsing, validation, persistence and permission checks |

FormGrid responds to its own container. DetailTable keeps horizontal scrolling inside the panel and uses consumer-provided widths and JSX. Neither component infers or executes business rules from database metadata. SensitiveInput delegates its input so existing Field.Control associations and constraints are retained. ValueEditor preserves numeric-looking strings; conversion only happens in the consumer callback.

ERPBoost retains customer/product lookup requests, number conversion, Postgres type parsing, Hasura/REST clients, draft/ERP-send rules, names and validation. Existing Field/Fieldset, Card, Table, Tabs, DatePicker and layout components are still used for application-specific content. Connection/secret/schema forms are not new business services inside the UI library.

Validation covers exact-value and double-save protection, consumer validation errors, selected label retention, busy confirmation, Unicode avatar fallback and reveal-state reset. Desktop/mobile browser checks cover each new catalogue pattern, existing migrated patterns and catalogue search. Application browser fixtures block all saves, ERP requests and external network.
