# Form and rename compositions

`@mailboost/erpboost-ui/form-dialog` adds FormDialog on top of the unchanged RecordPanel, Button and native form. It owns a scrollable body, fixed actions, caller-provided error/labels/icons and optional leading actions. `busy` blocks submit and close; `submitDisabled` also guards programmatic submit events. Native required, pattern and URL validation remain active. Callers own async state, field disabling, dirty confirmation, validation rules and persistence.

Centered FormDialog keeps its default sibling Select popup above its content through a new scoped z-index rule. RecordPanel and Select are unchanged. ERPBoost still supplies its overlay container and field controls.

`@mailboost/erpboost-ui/inline-rename` adds controlled InlineRename. It focuses/selects on mount, commits on Enter/blur once, cancels on Escape with the exact initial value, and ignores composition events/keyCode 229. It does not trim, validate, persist, or restore focus to a replacement trigger. The caller owns the value and what happens after completion.

ERPBoost adopts FormDialog for connection creation/editing, secret creation/update and DB table/column forms, plus InlineRename for pipeline names. API handlers, permissions, field values, type conversion and Python/ERP behavior stay in the app. All source component/style files present at the start of this addition remain unchanged; the root index only appends exports.

Validation: 100 unit tests; production build, typecheck and standalone package check; 100 exported catalogue routes. Browser coverage includes native validation, nested popup Escape, busy close/duplicate-submit guards, long failure/retry, footer scrolling, exact-value rename/cancel and IME at 1280px/390px. Browser application checks use local responses, with no live persistence or external ERP/Python execution.
