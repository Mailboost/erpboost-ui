# Detail and property presentation compositions

Additive modules built over unchanged RecordPanel, Tabs and Fieldset. Existing component implementations and styles, including earlier extraction rounds, remain unchanged. Import either subpath or the root API and include `@mailboost/erpboost-ui/styles`.

| Subpath | Shared presentation | Application-owned behavior |
| --- | --- | --- |
| detail-panel | DetailPanel.Root/Body: right panel, context/title/badge, controlled tab navigation, stable tab/panel IDs, scrolling content and fixed sibling actions | Selected tab, content/loading/error state, status meanings, dirty/busy decisions, close/save callbacks, data and authorization |
| property-layout | PropertyRow label/control/description slots; PropertySection optional-field heading; FormSection semantic fieldsets | Field.Root/Label/Description, controls, value parsing, exact identifiers, required/read-only constraints, relation metadata, submit handler and persistence |

Render exactly one DetailPanel.Body for the selected content, including loading and error states. Body links to the active tab and remains keyboard-focusable. Optional `panelId` supports caller-owned heading IDs. RecordActions remains an unchanged sibling for fixed actions. The composition retains existing Tabs behavior: arrows focus tabs (including disabled tabs); Enter activates an enabled tab. It does not silently select a replacement tab or fetch data. `closeDisabled` delegates to unchanged RecordPanel, including nested-popup Escape handling and focus restoration.

Place PropertyRow inside the caller's Field.Root, with Field.Label and a control in the corresponding slots. Field.Description retains the native `aria-describedby` association. No value is cast, trimmed, formatted, parsed or serialized by the layout. Empty description arrays create no blank spacing. The row uses its actual container width and stacks labels above controls at 430px or less. Optional sections wrap long names without forcing horizontal page scroll. FormSection preserves semantic fieldset/legend behavior and disabled inheritance.

Catalogue examples cover native required/pattern validation and caller-owned submission. Behavior checks include label/description associations, exact `0001` and large-integer strings, disabled tabs, controlled loading content, generated IDs, busy Escape handling, nested popups, fixed actions, desktop/390px geometry and returning focus. Independent packed consumers import both subpaths without auth, AI or router integrations.

The accompanying ERPBoost adoption also fixes an inert schema-form action: table/column add and column-save buttons now submit the existing form instead of using `type="button"` with no callback. Browser validation fulfills three schema mutations locally with synthetic responses; these are not persisted database writes. All other writes, external ERP calls and Python execution remain blocked in that fixture.
