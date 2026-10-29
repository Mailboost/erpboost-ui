# Management presentation compositions

These additions keep all pre-existing component implementations and styles unchanged. Import the root package or the three subpaths together with `@mailboost/erpboost-ui/styles`.

| Subpath | Presentation responsibilities | Consumer responsibilities |
| --- | --- | --- |
| management-layout | ManagementLayout, ManagementTable, FormStack, IdentityCell, SettingsList/SettingsRow, ResponsiveLabel and SetupPanel compose headings, sections, tables, identities, settings rows, forms and setup placeholders | Queries, records, column content/visibility/width, role meanings, validation, permission checks and action callbacks |
| template-picker | TemplatePicker composes RecordPanel, OptionCard and Button; optional confirmation, Back focus restoration, busy controls, disabled and unavailable choices | Available templates, template code, replacement rules, applying the chosen ID and closing the picker |
| status-notice | StatusNotice composes Alert and Button; accessible localized dismissal, optional title/actions and wrapping messages | Message content, roles, request status, retry actions and clearing/replacing messages |

ManagementTable is a JSX composition of Table, not another query, sorting or persistence service. It accepts existing Table props and explicit `hideOnCompact`, column widths, alignment and muted/tabular presentation. Compact visibility is opt-in per header/cell; tables that should retain every column can instead specify minWidth and scroll. ERPBoost's secrets table retains all columns and scrolls horizontally; its connection table explicitly hides ERP/URL columns on narrow screens.

Place SettingsRow inside a consumer-owned Field.Root and supply Field.Label and the control as slots. The Field context and label association remain intact. SettingsList uses its available container width to stack label/control regions. IdentityCell contains no member, account or authorization model. ResponsiveLabel keeps the full accessible action name while displaying the compact text on narrow screens.

TemplatePicker emits only an exact option ID. Confirmation does not modify any template or execute code. Going Back restores focus to the original option. A choice removed or disabled during review cannot be applied; all choices and close controls are blocked while busy. The application determines whether replacement requires confirmation.

StatusNotice is controlled: clicking dismiss delegates a callback and does not hide future messages through internal visibility state. Caller-supplied text remains unchanged. The unchanged Alert primitive supplies the coordinated icon and colors, so applications do not add duplicate status icons.

Validation covers label/control association, full accessible labels, controlled notifications, disabled dismissal, exact template IDs, confirmation and focus restoration, changes to available choices, busy controls, compact columns, narrow settings rows, setup actions and notice wrapping. A standalone packed consumer verifies that these subpaths do not import authentication, AI or routing integrations. ERPBoost's browser fixture blocks writes, ERP sends and sync execution.
